import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { nanoid } from 'nanoid';

import { ResetToken } from './entities/ResetToken.entity';
import { MailService } from '../service/mail.service';
import { SignupDto } from './dto/SignupDto';
import { LoginDto } from './dto/loginDto';
import { VerificationmailService } from '../service/verificationmail/verificationmail.service';
import { User } from './entities/user.entity';
import { Adresse } from './entities/adresse.entity';
import { AdresseDto } from './dto/adresse.dto';
import { RefreshToken } from './entities/refresh-token.entity';

interface CachedUserData {
  code: string;
  userData: Omit<User, 'id'> & { password: string };
}

@Injectable()
export class AuthService {
  private codeCache = new Map<string, string>();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(ResetToken)
    private readonly resetTokenRepository: Repository<ResetToken>,

    @InjectRepository(Adresse)
    private readonly adresseRepository: Repository<Adresse>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly verificationmailService: VerificationmailService,
  ) {}
  async signup2(signupData: SignupDto): Promise<{ message: string }> {
    const {
      email,
      password,
      nom,
      prenom,
      Cin,
      telephone,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      adresse,
      date_naissance,
      role,
    } = signupData;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException({
        message: 'Cet email est déjà utilisé',
        field: 'email',
      });
    }

    const existingcin = await this.userRepository.findOne({ where: { Cin } });
    if (existingcin) {
      throw new BadRequestException({
        message: 'Ce numéro CIN est déjà utilisé',
        field: 'cin',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const userAdresse = await this.findOrCreate(adresse);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.verificationmailService.sendVerificationCode(email, code);

    this.codeCache.set(
      email,
      JSON.stringify({
        code,
        userData: {
          nom,
          prenom,
          Cin,
          telephone,
          email,
          date_naissance,
          password: hashedPassword,
          adresse: userAdresse,
          role,
        },
      }),
    );

    return { message: 'Un code de vérification a été envoyé à votre email' };
  }

  async confirmSignup(email: string, code: string): Promise<User> {
    const cached = this.codeCache.get(email);
    if (!cached) {
      throw new Error('Aucune demande de vérification trouvée pour cet email');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { code: storedCode, userData }: CachedUserData = JSON.parse(cached);

    if (storedCode !== code) {
      throw new Error('Code de vérification incorrect');
    }

    const userToCreate = this.userRepository.create({
      ...userData,
      adresse: userData.adresse,
      date_naissance: new Date(userData.date_naissance),
    });

    const savedUser = await this.userRepository.save(userToCreate);
    this.codeCache.delete(email);

    return savedUser;
  }
  async login(
  loginDto: LoginDto,
): Promise<{ access_token: string; refresh_token: string }> {
  try {
      console.log('Tentative de connexion avec:', loginDto.email);

    
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });
    console.log('Utilisateur trouvé:', user);
    
    if (!user) {
      console.log('Aucun utilisateur trouvé avec cet email');
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Identifiants invalides',
      });
    }
    
    // Vérification si l'utilisateur est bloqué
    if (user.isBlocked) {
      console.log('Tentative de connexion d\'un utilisateur bloqué');
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Votre compte a été bloqué. Veuillez contacter l\'administrateur.',
      });
    }
    
    console.log('Comparaison du mot de passe...');
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      console.log('Mot de passe incorrect');
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Identifiants invalides',
      });
    }
    
    console.log('Génération du token JWT...');
    const payload = { sub: user.id, username: `${user.nom} ${user.prenom}` };
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '60m',
    });
    const refresh_token = await this.jwtService.signAsync(
      { sub: user.id },
      { expiresIn: '7d' },
    );
    
    await this.refreshTokenRepository.save({
      token: refresh_token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      user,
    });
    
    return { 
      access_token, 
      refresh_token 
    };
  } catch (error) {
    console.error('Erreur lors du login:', error);
    
    // Gestion spécifique des erreurs
    if (error instanceof UnauthorizedException) {
      throw error; // Déjà formaté avec statusCode 401
    } else if (error instanceof ForbiddenException) {
      throw error; // Déjà formaté avec statusCode 403
    } else {
      throw new InternalServerErrorException({
        statusCode: 500,
        message: 'Erreur interne du serveur',
      });
    }
  }
}

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (user) {
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const resetToken = this.resetTokenRepository.create({
        token: nanoid(64),
        userId: user.id.toString(),
        expiryDate,
      });

      await this.resetTokenRepository.save(resetToken);
      await this.mailService.sendPasswordResetEmail(email, resetToken.token);
    }

    return { message: 'Si cet utilisateur existe, il recevra un email' };
  }

  async resetPassword(
    newPassword: string,
    resetToken: string,
  ): Promise<{ status: string; message: string }> {
    console.log('Début resetPassword - Token reçu:', resetToken);

    try {
      console.log('Recherche du token dans la base...');
      const token = await this.resetTokenRepository.findOne({
        where: { token: resetToken, expiryDate: MoreThanOrEqual(new Date()) },
      });
      console.log(
        'Résultat de la recherche:',
        token ? 'Token trouvé' : 'Token non trouvé',
      );

      if (!token) {
        console.log('Token invalide ou expiré');
        throw new UnauthorizedException(
          'Lien de réinitialisation invalide ou expiré.',
        );
      }

      console.log('Suppression du token...');
      await this.resetTokenRepository.delete(token.id);
      console.log("Recherche de l'utilisateur ID:", token.userId);
      const user = await this.userRepository.findOne({
        where: { id: Number(token.userId) },
      });
      if (!user) {
        console.log('Utilisateur non trouvé pour ID:', token.userId);
        throw new InternalServerErrorException('Utilisateur non trouvé.');
      }

      console.log('Hashage du nouveau mot de passe...');

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;

      console.log("Sauvegarde de l'utilisateur...");
      await this.userRepository.save(user);
      return {
        status: 'success',
        message: 'Mot de passe réinitialisé avec succès',
      };

      console.log('Réinitialisation terminée avec succès');
    } catch (error) {
      console.error('Erreur dans resetPassword:', error);
      throw error; // Rejeter l'erreur pour qu'elle soit gérée en amont
    }
  }
  async changePassword(
    oldPassword: string,
    newPassword: string,
    userId: number,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Ancien mot de passe incorrect');
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = newHashedPassword;
    await this.userRepository.save(user);

    return { message: 'Mot de passe modifié avec succès' };
  }

  async getRole(userId: number): Promise<{ role: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('Utilisateur introuvable');
    }
    return { role: user.role };
  }

  async signup(signupData: SignupDto): Promise<User> {
    const {
      email,
      password,
      nom,
      prenom,
      Cin,
      telephone,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      adresse,
      date_naissance,
      role,
    } = signupData;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new Error('Cet email est déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const userAdresse = await this.findOrCreate(adresse);

    const newUser = this.userRepository.create({
      nom,
      prenom,
      Cin,
      telephone,
      email,
      date_naissance,
      password: hashedPassword,
      adresse: userAdresse,
      role,
    });

    try {
      return await this.userRepository.save(newUser);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error("Erreur lors de la création de l'utilisateur");
    }
  }

  async findOrCreate(adresseDTO: AdresseDto): Promise<Adresse> {
    let adresse = await this.adresseRepository.findOne({
      where: {
        rue: adresseDTO.rue,
        ville: adresseDTO.ville,
        gouvernat: adresseDTO.gouvernat,
        codePostal: adresseDTO.codePostal,
        pays: adresseDTO.pays,
      },
    });

    if (!adresse) {
      adresse = this.adresseRepository.create(adresseDTO);
      adresse = await this.adresseRepository.save(adresse);
    }

    return adresse;
  }
  async getAllUsers(): Promise<User[]> {
    try {
      return await this.userRepository.find({ 
        relations: ['adresse'],
        select: [
          'id',
          'nom',
          'prenom',
          'email',
          'Cin',
          'telephone',
          'date_naissance',
          'role',
          'isBlocked',
        ],
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw new InternalServerErrorException(
        'Erreur interne lors de la récupération des utilisateurs'
      );
    }
  }
  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['adresse'],
      select: [
        'id',
        'nom',
        'prenom',
        'email',
        'Cin',
        'telephone',
        'date_naissance',
        'role',
        'isBlocked'
      ]
    });
  
    if (!user) {
      throw new NotFoundException(`Aucun utilisateur trouvé avec l'ID ${id}`);
    }
  
    return user;
  }
  async getUserByCin(Cin: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { Cin },
      relations: ['adresse'],
      select: [
        'id',
        'nom',
        'prenom',
        'email',
        'Cin',
        'telephone',
        'date_naissance',
        'role',
        'isBlocked'
      ]
    });
  
    if (!user) {
      throw new NotFoundException(`Aucun utilisateur trouvé avec l'CIN ${Cin}`);
    }
  
    return user;
  }
  async isEmailExists(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    return !!user;
  }
  async isCinExists(cin: number): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { Cin: cin } });
    return !!user;
  }
  async isUserBlocked(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ 
      where: { email },
      select: ['isBlocked'],
    });
    
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    
    return user.isBlocked;
  }
  // auth.service.ts
async refreshToken(oldRefreshToken: string) {
  const tokenEntity = await this.refreshTokenRepository.findOne({
    where: { token: oldRefreshToken },
    relations: ['user']
  });

  if (!tokenEntity || tokenEntity.expiresAt < new Date()) {
    throw new UnauthorizedException('Refresh token invalide');
  }

  // Générer nouveaux tokens
  const payload = { sub: tokenEntity.user.id };
  const access_token = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
  const refresh_token = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

  // Mettre à jour le refresh token en BDD
  await this.refreshTokenRepository.update(tokenEntity.id, {
    token: refresh_token,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  return { access_token, refresh_token };
}

async invalidateRefreshToken(token: string) {
  await this.refreshTokenRepository.delete({ token });
}
}
