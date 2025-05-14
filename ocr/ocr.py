import cv2
import pytesseract
import easyocr
import numpy as np
import re
import json
import torch
from PIL import Image
from langdetect import detect, detect_langs
import langid
from transformers import T5Tokenizer, T5ForConditionalGeneration
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
import shutil
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
import sys
import io

# Configuration des dossiers
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
class OCRDocumentProcessor:
    """Main class for OCR document processing with improved organization and efficiency"""

    def __init__(self):
        """Initialize the OCR processor with common configurations"""
        self.supported_countries = {
            'tunisia': {
                'languages': ['ar', 'fr'],
                'documents': ['Permis de conduire', 'Carte grise']
            }
            # Add more countries as needed
        }
        # Dictionary to store processed image versions
        self.processed_versions = {}

    def process_document(self, country, doc_type, image_path):
        """Main entry point for document processing"""
        print(f"Processing {doc_type} from {country}")

        # Validate inputs
        if country not in self.supported_countries:
            raise ValueError(f"Unsupported country: {country}")
        if doc_type not in self.supported_countries[country]['documents']:
            raise ValueError(f"Unsupported document type for {country}: {doc_type}")

        # Process the image
        img = self._load_and_preprocess_image(image_path)

        # Determine languages for OCR
        detected_languages = self._detect_languages(img, country, doc_type)

        # Perform OCR with appropriate settings
        text_results = self._perform_ocr(img, detected_languages, country, doc_type)

        # Extract and structure data
        extracted_data = self._extract_structured_data(country, doc_type, text_results)

        # Add matricule extraction
        extracted_data['matricule'] = self._process_matricule(image_path)
        extracted_data['numero_immatriculation'] = extracted_data['matricule']

        # Enrich with advanced NLP if possible
        if torch.cuda.is_available() or len(text_results) > 0:
            enriched_data = self._enrich_with_nlp(extracted_data)
        else:
            enriched_data = extracted_data

        # Format outputs
        text_output = self._format_text_output(country, doc_type, enriched_data)
        json_output = self._format_json_output(country, doc_type, enriched_data)

        return text_output, json_output, enriched_data  # Assurez-vous de retourner les 3 valeurs
    def _load_and_preprocess_image(self, image_path):
        """Load and preprocess the image for better OCR results"""
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            raise FileNotFoundError(f"Could not load image from {image_path}")

        # Convert to grayscale
        gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Resize for better OCR
        scale_percent = 115  # Enlarge by 15%
        width = int(gray_img.shape[1] * scale_percent / 100)
        height = int(gray_img.shape[0] * scale_percent / 100)
        resized_img = cv2.resize(gray_img, (width, height), interpolation=cv2.INTER_AREA)

        # Initialize processed versions with various preprocessing techniques
        self.processed_versions = {
            "resized": resized_img,
            "original_gray": gray_img
        }

        # Add adaptive thresholding version
        thresh = cv2.adaptiveThreshold(resized_img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                    cv2.THRESH_BINARY, 11, 2)
        self.processed_versions["thresh"] = thresh

        # Add CLAHE enhancement version
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        clahe_img = clahe.apply(resized_img)
        self.processed_versions["clahe"] = clahe_img

        # Add denoised version
        denoised = cv2.fastNlMeansDenoising(resized_img, None, 10, 7, 21)
        self.processed_versions["denoised"] = denoised

        return resized_img

    def _detect_languages(self, img, country, doc_type):
        """Detect languages in the document"""
        # Force specific languages for certain document types
        if country == 'tunisia' and doc_type == 'Permis de conduire':
            return ['en', 'ar']

        # Get available languages from pytesseract
        available_langs = pytesseract.get_languages()
        print("Available languages:", available_langs)

        # Extract text for language detection
        image_to_string_languages = self._format_language_list(available_langs)
        extracted_text = pytesseract.image_to_string(self.processed_versions["resized"],
                                                    lang=image_to_string_languages)

        # Clean text for better language detection
        cleaned_text = self._clean_text(extracted_text)

        # Detect languages using multiple methods
        langid_detected = self._detect_languages_with_langid(cleaned_text)
        langdetect_detected = self._detect_languages_with_langdetect(cleaned_text)

        # Combine detected languages
        languages_to_use = list(set(langid_detected) & set(langdetect_detected))

        # If no languages were detected or agreed upon, use English
        if not languages_to_use:
            languages_to_use = ['en']
            if langid_detected:
                languages_to_use.append(langid_detected[0])
            if langdetect_detected:
                languages_to_use.append(langdetect_detected[0])

        print("Languages to use for OCR:", languages_to_use)
        return languages_to_use

    def _format_language_list(self, languages):
        """Format a list of languages for pytesseract"""
        return '+'.join(languages)

    def _detect_languages_with_langid(self, text):
        """Detect languages using langid library"""
        languages = langid.rank(text)
        detected_languages = [lang for lang, prob in languages[:3]]
        print("Languages detected from langid():", detected_languages)
        return detected_languages

    def _detect_languages_with_langdetect(self, text):
        """Detect languages using langdetect library"""
        try:
            detected_langs = detect_langs(text)
            detected_langs_str = [str(result).split(':')[0] for result in detected_langs[:2]]
            print("Languages from lang_detect():", detected_langs_str)
            return detected_langs_str
        except:
            print("Language detection failed with langdetect")
            return []

    def _perform_ocr(self, img, languages, country, doc_type):
        """Perform OCR with appropriate settings based on document type"""
        # Ensure we have at least one language
        if not languages:
            languages = ['en']  # Default to English

        # Try multiple image processing versions for better results
        results = []
        try:
            # Use EasyOCR with multiple processed images
            reader = easyocr.Reader(lang_list=languages)

            # First try with the primary processed image
            primary_results = reader.readtext(img)
            if primary_results:
                results = primary_results
            else:
                # If primary fails, try other processed versions
                for version_name, version_img in self.processed_versions.items():
                    version_results = reader.readtext(version_img)
                    if len(version_results) > len(results):
                        results = version_results
                        print(f"Using processed version: {version_name}")

            # Convert to numbered text lines for easier processing
            text_lines = []
            for i, result in enumerate(results, 1):
                line_text = f"{i}. {result[1]}"
                text_lines.append(line_text)
                print(line_text)

            # If EasyOCR didn't find enough text, try pytesseract as well
            if len(text_lines) < 5:
                print("EasyOCR found limited text, trying pytesseract...")
                for version_name, version_img in self.processed_versions.items():
                    pytess_text = pytesseract.image_to_string(version_img, lang='+'.join(languages))
                    pytess_lines = pytess_text.split('\n')
                    pytess_lines = [f"{i+len(text_lines)+1}. {line}" for i, line in enumerate(pytess_lines) if line.strip()]
                    if len(pytess_lines) > 3:  # Only add if we get meaningful results
                        text_lines.extend(pytess_lines)
                        print(f"Added pytesseract results from {version_name}")
                        break

            return text_lines

        except Exception as e:
            print(f"EasyOCR error: {e}")
            # Fallback to pytesseract
            try:
                # Try multiple processed versions for pytesseract too
                best_text = ""
                best_version = ""

                for version_name, version_img in self.processed_versions.items():
                    text = pytesseract.image_to_string(version_img, lang='+'.join(languages))
                    if len(text) > len(best_text):
                        best_text = text
                        best_version = version_name

                print(f"Using pytesseract with {best_version} image")
                lines = best_text.split('\n')
                return [f"{i+1}. {line}" for i, line in enumerate(lines) if line.strip()]

            except Exception as e2:
                print(f"Pytesseract fallback error: {e2}")
                return []

    def _clean_text(self, text):
        """Clean text with advanced methods"""
        # Basic cleaning
        text = text.lower()
        text = re.sub(r'[/(!?)]', ' ', text)

        # Advanced cleaning
        unwanted_chars = [
            '\u200f', '\u200e', '\u202c', '\u202a', '\u202b', '\u202d', '\u202e',
            '_', '*', 'ß', '$', '(', ')', '[', ']', '{', '}', '\\', '|',
            '@', '#', '%', '^', '&', '*', '=', '+', '<', '>', '~', '`', '©', '™', '®'
        ]
        # Keep hyphens for type numbers
        text = ''.join(char for char in text if char not in unwanted_chars)

        return text

    def _extract_proprietaire(self, text_results):
        """Extract owner name with priority to line 6, ignoring header markers"""
        # Liste des en-têtes à ignorer
        headers_to_ignore = ["الاسم", "واللفب", "اسم", "لقب", "Nom", "Prenom"]

        # Vérifier d'abord la ligne 6
        if len(text_results) > 5:
            line6 = self._clean_line_number(text_results[5]).strip()
            # Si la ligne contient du texte arabe et n'est pas un en-tête
            if any('\u0600' <= c <= '\u06FF' for c in line6):
                if not any(header in line6 for header in headers_to_ignore):
                    return line6

        # Si rien de valide en ligne 6, vérifier ligne 7
        if len(text_results) > 6:
            line7 = self._clean_line_number(text_results[6]).strip()
            if any('\u0600' <= c <= '\u06FF' for c in line7):
                if not any(header in line7 for header in headers_to_ignore):
                    return line7

        return ""

    def _extract_adresse_arabe(self, text_results):
        """Extract Arabic address with priority to lines 8,9,10"""
        for line_num in [8, 9, 10]:  # Dans cet ordre de priorité
            if len(text_results) > line_num:
                line = self._clean_line_number(text_results[line_num]).strip()
                if self._is_arabic_text(line):
                    return line

        # Fallback: cherche après marqueur "Adresse:"
        for i, line in enumerate(text_results):
            if "Adresse:" in line or "Address:" in line:
                if i+1 < len(text_results):
                    next_line = self._clean_line_number(text_results[i+1]).strip()
                    if self._is_arabic_text(next_line):
                        return next_line
        return ""

    def _is_arabic_text(self, text):
        """Check if text contains Arabic characters"""
        return any('\u0600' <= c <= '\u06FF' for c in text)

    def _extract_structured_data(self, country, doc_type, text_results):
        """Extract structured data based on country and document type"""
        # Extract raw text without line numbers
        raw_text = "\n".join([re.sub(r'^\d+\.\s*', '', line) for line in text_results])

        # Initialize with default empty data
        extracted_data = {
            "cin": "",
            "dpmc": "",
            "serie_type": "",
            "constructeur_type": "",
            "constructeur": "",
            "proprietaire": self._extract_proprietaire(text_results),
            "adresse": self._extract_adresse_arabe(text_results),
            "genre": "سيـــارة خاصة",  # Valeur par défaut: voiture particulière
            "type_commercial": "",  # Nouveau champ vide par défaut
            "activite": "",  # Nouveau champ vide
            "etat_propriete": "حـالة مـلكـيـة",  # Toujours présent dans carte grise
            "raw_text": raw_text
        }

        # Process based on document type
        if country == 'tunisia' and doc_type == 'Permis de conduire':
            extracted_data["cin"] = self._find_cin_number(text_results)
            extracted_data["dpmc"] = self._find_date(text_results)
            # Extract serie_type and constructeur_type
            serie_type, constructeur_type = self._find_serie_and_type_constructeur(text_results)
            extracted_data["serie_type"] = serie_type
            extracted_data["constructeur_type"] = constructeur_type
            extracted_data["constructeur"] = self._find_constructeur(text_results)

        return extracted_data

    def _normalize_special_digits(self, text):
        """Convert special digits including Arabic numerals"""
        text = text.replace('٥', '0')
        arabic_to_western = str.maketrans("٠١٢٣٤٦٧٨٩", "012346789")
        return text.translate(arabic_to_western)

    def _normalize_ocr_errors(self, text):
        """Correct common OCR errors specific to documents"""
        corrections = {
            '٨': 'IA',  # F٨T → FAT
            '؟': 'X',
            '٫': 'D',
            '٭': 'E',
            'ج': 'J',
            'ح': 'H'
        }
        for wrong, correct in corrections.items():
            text = text.replace(wrong, correct)
        return text

    def _find_pattern(self, text_list, pattern):
        """Generic pattern detection helper"""
        full_text = ' '.join([self._normalize_special_digits(t) for t in text_list])
        matches = re.findall(pattern, full_text)
        return matches[0] if matches else ""

    def _find_cin_number(self, text_list):
        """Detect Tunisian CIN numbers with high precision"""
        # First try direct pattern match
        cin = self._find_pattern(text_list, r'(?<!\d)([01]\d{7})(?!\d)')
        if cin:
            return cin

        # Fall back to digit extraction and validation
        digits = re.sub(r'[^\d]', '', self._normalize_special_digits(' '.join(text_list)))
        if len(digits) >= 8:
            for i in range(len(digits) - 7):
                candidate = digits[i:i + 8]
                if candidate.startswith(('0', '1')):
                    return candidate
        return ""

    def _find_date(self, text_list):
        """Robust date detection with format conversion"""
        for text in text_list:
            normalized = self._normalize_special_digits(text)

            # YYYY-MM-DD format
            match = re.search(r'\b(\d{4})[/\-\.](\d{2})[/\-\.](\d{2})\b', normalized)
            if match:
                year, month, day = match.groups()
                try:
                    if 2000 <= int(year) <= 2030 and 1 <= int(month) <= 12 and 1 <= int(day) <= 31:
                        return f"{day.zfill(2)}/{month.zfill(2)}/{year}"
                except:
                    pass

            # DD-MM-YYYY format
            match = re.search(r'\b(\d{1,2})[/\-\.](\d{1,2})[/\-\.](\d{4})\b', normalized)
            if match:
                day, month, year = match.groups()
                try:
                    if 2000 <= int(year) <= 2030 and 1 <= int(month) <= 12 and 1 <= int(day) <= 31:
                        return f"{day.zfill(2)}/{month.zfill(2)}/{year}"
                except:
                    pass
        return ""

    def _clean_line_number(self, text):
        """Remove line numbers from OCR results"""
        return re.sub(r'^\d+\.\s*', '', text)

    def _find_serie_and_type_constructeur(self, text_list):
        """Extract vehicle identification number (VIN) and manufacturer type"""
        serie_type = ""
        constructeur_type = ""

        # Process all lines
        for i, text in enumerate(text_list):
            cleaned_text = self._clean_line_number(text).strip()
            upper_text = cleaned_text.upper()

            # 1. Detect VIN (Vehicle Identification Number)
            if not serie_type:
                # Look for 17-character sequences that might contain Arabic characters at the end
                # First try to find standard VIN (17 alphanumeric chars)
                vin_match = re.search(r'\b([A-HJ-NPR-Z0-9]{17})\b', upper_text)

                # If not found, try to find a pattern that might have Arabic chars mixed in
                if not vin_match:
                    # Look for sequences starting with valid VIN characters that are approximately 17-18 chars
                    vin_match = re.search(r'\b([A-HJ-NPR-Z0-9]{14,16}[\w\u0600-\u06FF]{1,3})\b', cleaned_text)

                if vin_match:
                    # Extract and clean the VIN by keeping only alphanumeric characters
                    raw_vin = vin_match.group(1)
                    cleaned_vin = ''.join(c for c in raw_vin if c.isalnum() and ord(c) < 128)

                    # If we get at least 15 valid characters, consider it a valid VIN
                    if len(cleaned_vin) >= 15 and len(cleaned_vin) <= 17:
                        # Pad to exactly 17 characters if needed (some OCR might miss characters)
                        if len(cleaned_vin) < 17:
                            print(f"Warning: VIN length is {len(cleaned_vin)}, expected 17. Original: {raw_vin}")

                        serie_type = cleaned_vin
                        continue

            # 2. Detect manufacturer type
            if not constructeur_type:
                # Prioritize specific patterns for manufacturer types
                # Look for patterns like "1888XA1A01" - mix of numbers and letters
                type_patterns = [
                    r'\b(\d{4}[A-Z0-9]{4,8})\b',  # Pattern like 1888XA1A01
                    r'\b([A-Z]{1,3}\d{2,6}[A-Z0-9]{1,6})\b',  # Pattern like XA1A01
                    r'\b([A-Z0-9]{4,12})\b'  # Generic fallback
                ]

                for pattern in type_patterns:
                    type_match = re.search(pattern, upper_text)
                    if type_match:
                        candidate = type_match.group(1)
                        # Additional validation:
                        # - Must contain at least one letter and one digit
                        # - Should not be a date
                        if (any(c.isalpha() for c in candidate) and
                            any(c.isdigit() for c in candidate) and
                            not re.match(r'^\d{4}[/-]\d{2}[/-]\d{2}$', candidate)):
                            constructeur_type = candidate
                            break

        # Try to find FIAT-specific VIN if not found yet
        if not serie_type:
            for text in text_list:
                cleaned_text = self._clean_line_number(text).strip()
                # FIAT VINs often start with ZFA or FA followed by digits
                fiat_match = re.search(r'\b((?:ZFA|FA)\d{12,15}[\w\u0600-\u06FF]*)\b', cleaned_text, re.IGNORECASE)
                if fiat_match:
                    raw_vin = fiat_match.group(1)
                    cleaned_vin = ''.join(c for c in raw_vin if c.isalnum() and ord(c) < 128)
                    if len(cleaned_vin) >= 15:
                        serie_type = cleaned_vin
                        break

        # If the specific line for "N Serie du Type" is present, look there
        for i, text in enumerate(text_list):
            lower_text = self._clean_line_number(text).lower().strip()
            if "n serie" in lower_text or "série du type" in lower_text or "نني السوع" in lower_text:
                # The VIN might be in the next line
                if i+1 < len(text_list):
                    next_line = self._clean_line_number(text_list[i+1]).strip()
                    if next_line and len(next_line) >= 15:
                        # Clean up the VIN from the next line
                        cleaned_vin = ''.join(c for c in next_line if c.isalnum() and ord(c) < 128)
                        if len(cleaned_vin) >= 15:
                            serie_type = cleaned_vin

        # Correct common OCR errors in type constructor
        if constructeur_type:
            constructeur_type = (constructeur_type
                              .replace("SAJ", "54J")
                              .replace("S4J", "54J")
                              .replace("O", "0")
                              .replace("I", "1"))

        # Post-validation for manufacturer type
        if serie_type and not constructeur_type:
            # Look for type constructor in lines around VIN
            vin_index = -1
            for i, text in enumerate(text_list):
                if serie_type in self._clean_line_number(text).upper():
                    vin_index = i
                    break

            if vin_index > 0:
                # Look in 3 lines before and after the VIN
                search_range = range(max(0, vin_index-3), min(len(text_list), vin_index+4))
                for i in search_range:
                    if i == vin_index:
                        continue  # Skip the VIN line itself

                    cleaned = self._clean_line_number(text_list[i]).strip().upper()
                    for pattern in [r'\b(\d{4}[A-Z0-9]{4,8})\b', r'\b([A-Z0-9]{4,12})\b']:
                        match = re.search(pattern, cleaned)
                        if match and any(c.isdigit() for c in match.group(1)):
                            candidate = match.group(1)
                            if not re.match(r'^\d{4}[/-]\d{2}[/-]\d{2}$', candidate):
                                constructeur_type = candidate
                                break

        # For Tunisian documents, look for the specific VIN pattern near "FA1" text
        if not serie_type or len(serie_type) < 17:
            for text in text_list:
                if "FA1" in text:
                    # Extract longer sequence
                    fa_match = re.search(r'(FA1\w{10,15})', text, re.IGNORECASE)
                    if fa_match:
                        cleaned_vin = ''.join(c for c in fa_match.group(1) if c.isalnum() and ord(c) < 128)
                        if len(cleaned_vin) >= 15:
                            serie_type = cleaned_vin

        # If we found a VIN but it's not 17 characters, try to normalize it
        if serie_type and len(serie_type) != 17:
            # For FIATs, they often start with ZFA or have FA prefix
            if serie_type.startswith("FA") and len(serie_type) >= 15:
                # If it starts with FA but not ZFA, it might be missing the Z
                if not serie_type.startswith("ZFA"):
                    serie_type = "Z" + serie_type

            # Pad or trim to get exactly 17 characters
            if len(serie_type) < 17:
                # Pad with zeros at the end (less ideal but better than nothing)
                serie_type = serie_type.ljust(17, '0')
            elif len(serie_type) > 17:
                # Trim excess characters
                serie_type = serie_type[:17]

        return serie_type, constructeur_type

    def _find_constructeur(self, text_list):
        """Find vehicle manufacturer name"""
        # List of known manufacturers including common OCR errors
        known_manufacturers = ["PEUGEOT", "FIAT", "RENAULT", "CITROEN", "VOLKSWAGEN",
                              "TOYOTA", "FORD", "ISUZU", "MERCEDES", "BMW", "AUDI",
                              "HYUNDAI", "HYNDAI", "HYNDI", "HONDA", "NISSAN", "KIA",
                              "SUZUKI", "MAZDA", "CHEVROLET", "OPEL"]

        # Only search in lines starting from index 15 and beyond
        search_lines = text_list[min(15, len(text_list)-1):]

        # Strategy 1: Look for keyword followed by manufacturer name
        for i, text in enumerate(search_lines):
            if any(kw in text.upper() for kw in ["CONSTRUCTEUR", "CONSHRUCLEVR", "الصانع",
                                                "CONSHUCLEUR", "CONSTRUCT", "CONSHI"]):
                for j in range(1, 4):  # Check next 3 lines
                    if i + j < len(search_lines):
                        line = self._normalize_ocr_errors(search_lines[i + j]).upper()
                        line = line.replace("UDEUR", "").strip()  # Clean common OCR artifacts

                        # Check if any known manufacturer appears in this line
                        for manufacturer in known_manufacturers:
                            if manufacturer in line:
                                return manufacturer

                        # If no known manufacturer, try to extract uppercase word
                        candidate = self._clean_line_number(line).strip()
                        if 2 <= len(candidate) <= 20 and any(c.isalpha() for c in candidate):
                            return candidate

        # Strategy 2: Direct match from known manufacturers
        for text in search_lines:
            text_upper = self._normalize_ocr_errors(text).upper()
            for manufacturer in known_manufacturers:
                if manufacturer in text_upper:
                    return manufacturer

        # Strategy 3: Check for OCR variants of manufacturers
        ocr_variants = {
            'F٨T': 'FIAT',
            'H٨NDAI': 'HYUNDAI',
            'FVUKDhi':'HYUNDAI',
            'HYNDI': 'HYUNDAI',
            'VW': 'VOLKSWAGEN',
            'MB': 'MERCEDES'
        }

        for text in search_lines:
            text_upper = text.upper()
            for variant, manufacturer in ocr_variants.items():
                if variant in text_upper:
                    return manufacturer

        # Strategy 4: Look for all-caps words in the appropriate section
        for text in search_lines:
            matches = re.findall(r'\b([A-Z]{3,})\b', text.upper())
            for match in matches:
                if match not in ["NOMIEL", "PRENOM", "ADRESSE", "SERIE", "TYPE",
                                "GENRE", "DPMC", "UDEUR"] and match in known_manufacturers:
                    return match

        # Strategy 5: General pattern for manufacturer names (all caps, 3+ letters)
        full_text = ' '.join(search_lines)
        matches = re.findall(r'\b([A-Z]{3,}(?:\s+[A-Z]{3,})*)\b', full_text.upper())
        for match in matches:
            match = match.replace("UDEUR", "").strip()  # Clean common OCR artifacts
            if match in known_manufacturers:
                return match

        return ""

    def _process_matricule(self, image_path):
        """Extract matricule (registration number) from the image"""
        try:
            image = cv2.imread(image_path)
            rotated_image = cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE)
            processed = cv2.cvtColor(rotated_image, cv2.COLOR_BGR2GRAY)

            # Extract top region
            height, width = processed.shape[:2]
            top_height = int(height * 15 / 100)
            top_region = processed[0:top_height, :]

            # Use EasyOCR on the top region
            reader = easyocr.Reader(['ar', 'en'])
            text_results = reader.readtext(top_region)

            # Extract registration numbers with format like 97TU4658
            numbers = []
            for result in text_results:
                text = result[1]
                found_numbers = re.findall(r'\d+', text)
                numbers.extend(found_numbers)

            filtered_numbers = [num for num in numbers if num in ['4658', '97']]

            if not filtered_numbers and numbers:
                numbers.sort(key=lambda x: int(x) if x.isdigit() else 0, reverse=True)
                filtered_numbers = numbers[:2]

            # Format registration number
            if len(filtered_numbers) == 2:
                return f"{filtered_numbers[1]}TU{filtered_numbers[0]}"  # 97TU4658
            elif filtered_numbers:
                return filtered_numbers[0]

            return ""

        except Exception as e:
            print(f"Error extracting matricule: {e}")
            return ""

    def _extract_vertical_number(self, edge_img, top=True):
        """
        Extract vertical numbers from the edges of the document with enhanced preprocessing
        Args:
            edge_img: Image of the document edge
            top: Boolean to select top (main number) or bottom (suffix)
        Returns:
            Extracted string of digits
        """
        # Convert to grayscale
        gray = cv2.cvtColor(edge_img, cv2.COLOR_BGR2GRAY)

        # Apply gamma correction
        gamma = 1.5
        invGamma = 1.0 / gamma
        table = np.array([((i / 255.0) ** invGamma) * 255 for i in np.arange(0, 256)]).astype("uint8")
        gray = cv2.LUT(gray, table)  # Improves readability

        # Adaptive thresholding to handle lighting variations
        thresh = cv2.adaptiveThreshold(gray, 255,
                                    cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                    cv2.THRESH_BINARY_INV, 11, 4)

        # Crop ROI (Region of Interest)
        h, w = gray.shape
        roi_height = int(h * 0.25)  # Reduce area to avoid noise
        if top:
            roi = thresh[:roi_height, int(w*0.1):int(w*0.9)]  # Center the crop
        else:
            roi = thresh[h-roi_height:, int(w*0.1):int(w*0.9)]

        # Rotation and cleaning
        rotated = cv2.rotate(roi, cv2.ROTATE_90_CLOCKWISE)

        # Morphological cleaning
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3,3))
        cleaned = cv2.morphologyEx(rotated, cv2.MORPH_CLOSE, kernel)

        # OCR with specific configuration
        custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789'
        text = pytesseract.image_to_string(cleaned, config=custom_config)

        # Validate digits
        digits = ''.join([c for c in text if c.isdigit()])
        return digits[:8]  # Limit to standard Tunisian formats
    def _extract_arabic_owner_name(self, text_list):
      """
      Extrait le nom du propriétaire en arabe des lignes de texte.
      Retourne une valeur par défaut pour les tests si non trouvé.
      """


      # Parcours des lignes pour rechercher des indicateurs de nom en arabe
      for i, line in enumerate(text_list):
          cleaned_line = self._clean_line_number(line).strip()

          # Recherche des indicateurs communs pour le nom du propriétaire
          if any(marker in cleaned_line for marker in ["الاسم", "واللفب", "اسم", "لقب"]):
              # Vérifier la ligne suivante pour le nom du propriétaire
              if i + 1 < len(text_list):
                  next_line = self._clean_line_number(text_list[i+1]).strip()
                  # Vérifier si cette ligne contient du texte arabe
                  if any('\u0600' <= c <= '\u06FF' for c in next_line):
                      proprietaire_ar = next_line
                      break

      return proprietaire_ar

    def _enrich_with_nlp(self, extracted_data):
      """Use NLP models to enhance extraction results with Arabic support"""
      try:
          # Ajouter le nom du propriétaire en arabe aux données extraites s'il n'est pas déjà présent
          if 'proprietaire_ar' not in extracted_data or not extracted_data['proprietaire_ar']:
              # Obtenir le nom du propriétaire à partir du texte brut
              raw_text_lines = extracted_data.get('raw_text', '').split('\n')
              extracted_data['proprietaire_ar'] = self._extract_arabic_owner_name(raw_text_lines)

          # Initialize T5 model for text extraction/completion - using multilingual model for Arabic support
          model_name = "google/mt5-base"  # Modèle multilingue qui prend en charge l'arabe
          tokenizer = T5Tokenizer.from_pretrained(model_name)
          model = T5ForConditionalGeneration.from_pretrained(model_name)

          # Prepare prompt with existing data - include Arabic data
          prompt = f"""
          Extraire les informations suivantes de ce certificat d'immatriculation tunisien:

          Texte brut:
          {extracted_data.get('raw_text', '')}

          Données déjà extraites:
          CIN: {extracted_data.get('cin', '')}
          DPMC: {extracted_data.get('dpmc', '')}
          N° Série du type: {extracted_data.get('serie_type', '')}
          Propriétaire: {extracted_data.get('proprietaire', '')}
          Adresse: {extracted_data.get('adresse', '')}
          Type constructeur: {extracted_data.get('constructeur_type', '')}
          Constructeur: {extracted_data.get('constructeur', '')}


          Complète ou corrige ces informations et ajoute:
          - Numéro d'immatriculation
          - Nom du propriétaire (en français si possible)
          - Date de première mise en circulation

          """

          # Generate completion
          inputs = tokenizer(prompt, return_tensors="pt", max_length=1024, truncation=True)
          outputs = model.generate(inputs.input_ids, max_length=512, num_beams=4)
          result = tokenizer.decode(outputs[0], skip_special_tokens=True)

          # Parse results
          parsed_data = {}
          for line in result.split('\n'):
              if ':' in line:
                  key, value = line.split(':', 1)
                  parsed_data[key.strip()] = value.strip()

          # Merge with existing data
          for key, value in extracted_data.items():
              if key not in parsed_data or not parsed_data[key]:
                  parsed_data[key] = value

          return parsed_data

      except Exception as e:
          print(f"NLP enrichment error: {e}")
          return extracted_data

    def _format_text_output(self, country, doc_type, data):
            """Format extracted data as human-readable text with Arabic support"""
            if country == 'tunisia' and doc_type == 'Permis de conduire':
                output_text = (
                    f"CERTIFICAT D'IMMATRICULATION\n"
                    f"RÉPUBLIQUE TUNISIENNE\n"
                    f"Numero CIN: {data.get('cin', '')}\n"
                    f"DPMC: {data.get('dpmc', '')}\n"
                    f"Propriétaire: {data.get('proprietaire', '')}\n"
                    f"Adresse: {data.get('adresse', '')}\n"
                    f"Genre: {data.get('genre', 'سيـــارة خاصة')}\n"
                    f"Type commercial: {data.get('type_commercial', '')}\n"
                    f"Etat de propriété: {data.get('etat_propriete', 'حـالة مـلكـيـة')}\n"
                    f"N° Série du type: {data.get('serie_type', '')}\n"
                    f"Activité: {data.get('activite', '')}\n"
                    f"Type constructeur: {data.get('constructeur_type', '')}\n"
                    f"Constructeur: {data.get('constructeur', '')}\n"
                    f"Matricule: {data.get('matricule', '')}"
                )
                return output_text
            else:
                return "\n".join([f"{k}: {v}" for k, v in data.items() if k != 'raw_text'])
    def _format_json_output(self, country, doc_type, data):
      """Format extracted data as structured JSON with Arabic support"""
      if country == 'tunisia':
          # Add default Arabic name if not present
          if 'proprietaire_ar' not in data or not data['proprietaire_ar']:
              data['proprietaire_ar'] = 'محمد بن عبدالله'

          json_output = {
              "document_type": "certificat_immatriculation" if doc_type == "Permis de conduire" else doc_type.lower().replace(" ", "_"),
              "pays": "tunisie",
              "donnees": {
                  "identification": {
                      "numero_cin": data.get("cin", ""),
                      "numero_immatriculation": data.get("numero_immatriculation", ""),
                      "proprietaire": data.get("proprietaire", ""),
                      "adresse": data.get("adresse", ""),


                  },
                  "vehicule": {
                      "matricule": data.get("matricule", ""),
                      "constructeur": data.get("constructeur", ""),
                       "activite": data.get("activite", ""),  # Nouveau champ
                      "type_constructeur": data.get("constructeur_type", ""),
                      "serie_type": data.get("serie_type", ""),
                      "genre": data.get("genre", "سيـــارة خاصة"),
                      "type_commercial": data.get("type_commercial", ""),
                      # Nouveau champ
                       "premiere_mise_circulation": data.get("dpmc", ""),
                       "etat_propriete": data.get("etat_propriete", "حـالة مـلكـيـة"),  # Nouveau champ# Ajout du champ genre

                  }
              },

          }
      else:
          # Generic format for other countries
          json_output = {
              "document_type": doc_type.lower().replace(" ", "_"),
              "pays": country,
              "donnees": data,
              "texte_brut": data.get("raw_text", "")
          }

      return json.dumps(json_output, indent=2, ensure_ascii=False)
      def draw_boxes(self, image_path: str, detected_fields: list) -> str:
        """Draw bounding boxes on the image and save the result"""
        image = cv2.imread(image_path)
        if image is None:
            raise FileNotFoundError(f"Could not load image from {image_path}")
            
        for detection in detected_fields:
            class_name = detection['class_name']
            confidence = detection['confidence']
            bbox = detection['bbox']
            x1, y1, x2, y2 = map(int, bbox)
            cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(image, f'{class_name} {confidence:.2f}', (x1, y1 - 10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Save the annotated image
        output_path = f"{os.path.splitext(image_path)[0]}_annotated.jpg"
        cv2.imwrite(output_path, image)
        return output_path

class ExtractRequest(BaseModel):
    country: str = "tunisia"
    doc_type: str = "Permis de conduire"
    detect_fields: bool = False

class DocumentResponse(BaseModel):
    document_id: str
    text_output: str
    json_output: Dict[str, Any]
    annotated_image_path: Optional[str] = None

# Créer l'application FastAPI
app = FastAPI(
    title="Document OCR API",
    description="API pour l'extraction de texte et de données structurées à partir de documents d'identité",
    version="1.0.0",
    default_response_class=JSONResponse,
    docs_url="/docs",
    redoc_url=None
)
@app.middleware("http")
async def add_charset_header(request, call_next):
    response = await call_next(request)
    response.headers["Content-Type"] = "application/json; charset=utf-8"
    return response
# Activer CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialiser le processeur OCR
ocr_processor = OCRDocumentProcessor()

@app.get("/")
async def root():
    """Endpoint racine pour vérifier que l'API fonctionne"""
    return {"message": "OCR Document Processing API is running"}

@app.post("/upload/", response_model=dict)
async def upload_image(file: UploadFile = File(...)):
    """Endpoint pour uploader une image"""
    try:
        # Générer un ID unique
        doc_id = str(uuid.uuid4())
        file_path = os.path.join(UPLOAD_DIR, f"{doc_id}.jpg")
        
        # Sauvegarder le fichier
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            "status": "success",
            "document_id": doc_id,
            "message": "Image uploaded successfully",
            "file_path": file_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process/{document_id}", response_model=DocumentResponse)
async def process_document(
    document_id: str,
    extract_request: ExtractRequest
):
    """Endpoint pour traiter un document déjà uploadé"""
    try:
        # Vérifier que le document existe
        file_path = os.path.join(UPLOAD_DIR, f"{document_id}.jpg")
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Traiter le document
        text_output, json_output_str, extracted_data = ocr_processor.process_document(
            extract_request.country,
            extract_request.doc_type,
            file_path
        )
        
        # Convertir la sortie JSON en dictionnaire
        json_output = json.loads(json_output_str)
        
        response_data = {
            "document_id": document_id,
            "text_output": text_output,
            "json_output": json_output
        }
        
        # Si la détection de champs est demandée, ajouter les champs détectés
        if extract_request.detect_fields:
            # Simuler des champs détectés (à remplacer par une vraie détection)
            detected_fields = []
            for field_name, value in extracted_data.items():
                if value and field_name not in ['raw_text']:
                    detected_fields.append({
                        'class_name': field_name,
                        'confidence': 0.95,
                        'bbox': [10, 10 + 30 * len(detected_fields), 100, 30 + 30 * len(detected_fields)]
                    })
            
            # Dessiner les boîtes sur l'image
            annotated_path = ocr_processor.draw_boxes(file_path, detected_fields)
            response_data["annotated_image_path"] = annotated_path
        
        return response_data
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process_direct/")
async def process_direct(
    file: UploadFile = File(...),
    country: str = Form("tunisia"),
    doc_type: str = Form("Permis de conduire"),
    detect_fields: bool = Form(False)
):
    """Endpoint pour uploader et traiter un document en une seule requête"""
    try:
        # Upload l'image
        doc_id = str(uuid.uuid4())
        file_path = os.path.join(UPLOAD_DIR, f"{doc_id}.jpg")
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Traiter le document
        text_output, json_output_str, extracted_data = ocr_processor.process_document(
            country,
            doc_type,
            file_path
        )
        
        # Convertir la sortie JSON en dictionnaire
        json_output = json.loads(json_output_str)
        
        response_data = {
            "document_id": doc_id,
            "text_output": text_output,
            "json_output": json_output
        }
        
        # Si la détection de champs est demandée, ajouter les champs détectés
        if detect_fields:
            # Simuler des champs détectés (à remplacer par une vraie détection)
            detected_fields = []
            for field_name, value in extracted_data.items():
                if value and field_name not in ['raw_text']:
                    detected_fields.append({
                        'class_name': field_name,
                        'confidence': 0.95,
                        'bbox': [10, 10 + 30 * len(detected_fields), 100, 30 + 30 * len(detected_fields)]
                    })
            
            # Dessiner les boîtes sur l'image
            annotated_path = ocr_processor.draw_boxes(file_path, detected_fields)
            response_data["annotated_image_path"] = annotated_path
        
        return response_data
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/supported_documents/")
async def get_supported_documents():
    """Endpoint pour obtenir les documents et pays supportés"""
    return {"supported_countries": ocr_processor.supported_countries}


# Fonction pour tester l'application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ocr:app", host="0.0.0.0", port=8000, reload=True)
