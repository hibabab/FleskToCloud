import { BadRequestException, Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Post } from '@nestjs/common';
import { IsNumber, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentService } from 'src/paiement/services/payment/payment.service';

// DTOs avec validation complète
class GeneratePaymentDto {
  @IsNumber()
  @Type(() => Number)
  contratNum: number;

  @IsUrl()
  successUrl: string;

  @IsUrl()
  failUrl: string;
}

class CreateLocalPaymentDto {
  @IsNumber()
  @Type(() => Number)
  contratNum: number;
}


@Controller('payments')
export class PaymentGatewayController {
  constructor(private readonly paymentGatewayService: PaymentService) {}

  @Post('generate')
  async generatePayment(@Body() paymentData: GeneratePaymentDto) {
    try {
      return await this.paymentGatewayService.generatePaymentLink(
        paymentData.contratNum,
        paymentData.successUrl,
        paymentData.failUrl
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post('local')
  async createLocalPayment(@Body() paymentData: CreateLocalPaymentDto) {
    try {
      if (!paymentData.contratNum) {
        throw new BadRequestException('Le numéro de contrat est requis');
      }
      return await this.paymentGatewayService.createLocalPayment(paymentData.contratNum);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la création du paiement local');
    }
  }

  @Get('verify/:paymentId')
  async verifyPayment(@Param('paymentId') paymentId: string) {
    try {
      return await this.paymentGatewayService.verifyPayment(paymentId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la vérification du paiement');
    }
  }

  @Get('status/:contratNum')
  async getPaymentStatus(@Param('contratNum', ParseIntPipe) contratNum: number) {
    try {
      return await this.paymentGatewayService.getPaymentByContrat(contratNum);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la récupération du statut');
    }
  }

  @Post('cancel/:contratNum')
  async cancelPayment(@Param('contratNum', ParseIntPipe) contratNum: number) {
    try {
      return await this.paymentGatewayService.cancelPayment(contratNum);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de l\'annulation du paiement');
    }
  }
}