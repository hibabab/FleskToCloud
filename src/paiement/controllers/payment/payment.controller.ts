import { BadRequestException, Body, Controller, Get, HttpException, HttpStatus, NotFoundException, Param, ParseIntPipe, Post } from '@nestjs/common';
import { IsNumber, IsString, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentService } from 'src/paiement/services/payment/payment.service';

// DTOs avec validation complète
class GeneratePaymentDto {
  @IsNumber()
  @Type(() => Number)
  contratNum: number;

  @IsString() // Au lieu de @IsUrl()
  successUrl: string;

  @IsString() // Au lieu de @IsUrl()
  failUrl: string;

}

class CreateLocalPaymentDto {
  @IsNumber()
  @Type(() => Number)
  contratNum: number;
}

interface PaymentResponse {
  success: boolean;
  data?: {
    paymentLink?: string;
    paymentId?: string;
    trackingId?: string;
    amount?: number;
    expiration?: string;
    status?: string;
    hasPayment?: boolean;
    paymentDate?: string;
    deleted?: boolean;
  };
  message?: string;
  timestamp?: string;
}
@Controller('payments')
export class PaymentGatewayController {
  constructor(private readonly paymentGatewayService: PaymentService) {}

  @Post('generate')
  async generatePayment(
    @Body() paymentData: GeneratePaymentDto
  ): Promise<{
    success: boolean;
    data: {
      paymentLink: string;
      paymentId: string;
      trackingId: string;
      amount: number;
      expiration?: string;
    
    };
    message: string;
    timestamp: string;
  }> {
    try {
      const payment = await this.paymentGatewayService.generatePaymentLink(
        paymentData.contratNum,
        paymentData.successUrl,
        paymentData.failUrl
      );

      // Formatage de la réponse selon l'interface attendue par le frontend
      return {
        success: true,
        data: {
          paymentLink: payment.paymentLink, // Utilisez paymentLink au lieu de paymentUrl
          paymentId: payment.paymentId,    // Correspond à votre entité
          trackingId: payment.trackingId,  // Correspond à votre entité
          amount: payment.amount,
          expiration: payment.expiration,  // Utilisez expiration directement
          
        },
        message: 'Lien de paiement généré avec succès',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      // Gestion structurée des erreurs
      if (error instanceof HttpException) {
        throw new HttpException({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString()
        }, error.getStatus());
      }

      // Erreurs métier spécifiques
      if (error.message.includes('Contrat non trouvé')) {
        throw new HttpException({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString()
        }, HttpStatus.NOT_FOUND);
      }

      if (error.message.includes('montant invalide')) {
        throw new HttpException({
          success: false,
          message: 'Le montant de l\'échéance n\'est pas valide',
          timestamp: new Date().toISOString()
        }, HttpStatus.BAD_REQUEST);
      }

      // Erreur générique
      throw new HttpException({
        success: false,
        message: 'Erreur lors de la génération du paiement',
        timestamp: new Date().toISOString()
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Post('local')
  async createLocalPayment(@Body() paymentData: CreateLocalPaymentDto) {
    try {
      if (!paymentData.contratNum) {
        throw new BadRequestException('Le numéro de contrat est requis');
      }
      
      // Appel au service existant
      const paymentResult = await this.paymentGatewayService.createLocalPayment(paymentData.contratNum);
      
      // Retourner une réponse standardisée pour le frontend
      return {
        success: true,
        message: 'Paiement local créé avec succès',
        data: {
          paymentId: paymentResult.paymentId, // ou trackingId selon ce que le frontend attend
          status: paymentResult.status,
          amount: paymentResult.amount,
          paymentDate: paymentResult.paymentDate,
          contratNum: paymentResult.contratNum
        }
      };
      
    } catch (error) {
      // Gestion des erreurs existante améliorée
      if (error instanceof HttpException) {
        // Préserver le status code original
        throw new HttpException(
          {
            success: false,
            message: error.message,
            error: 'PAYMENT_ERROR'
          },
          error.getStatus()
        );
      }
      
      // Erreur inattendue
      throw new BadRequestException({
        success: false,
        message: 'Erreur technique lors de la création du paiement',
        error: 'SERVER_ERROR'
      });
    }
  }

  @Get('verify/:paymentId')
  async verifyPayment(@Param('paymentId') paymentId: string) {
    try {
      const result = await this.paymentGatewayService.verifyPayment(paymentId);

      return {
        success: true,
        data: {
          status: result.status,
          contratNum: result.contratNum,
          amount: result.amount,
          ...(result.paymentDate && { paymentDate: result.paymentDate }),
          ...(result.deleted && { deleted: result.deleted })
        },
        message: result.status === 'PAID' 
          ? 'Payment verified successfully' 
          : 'Payment verification failed'
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get('status/:contratNum')
  async getPaymentStatus(@Param('contratNum', ParseIntPipe) contratNum: number) {
    try {
      const result = await this.paymentGatewayService.getPaymentByContrat(contratNum);

      if (!result.hasPayment) {
        return {
          success: true,
          data: {
            hasPayment: false,
            status: 'NO_PAYMENT',
            contratNum
          },
          message: 'No payment found for this contract'
        };
      }

      return {
        success: true,
        data: {
          hasPayment: true,
          paymentId: result.paymentId,
          trackingId: result.trackingId,
          status: result.status,
          amount: result.amount,
          paymentDate: result.paymentDate,
          contratNum
        },
        message: 'Payment status retrieved successfully'
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Post('cancel/:contratNum')
  async cancelPayment(@Param('contratNum', ParseIntPipe) contratNum: number) {
    try {
      const result = await this.paymentGatewayService.cancelPayment(contratNum);

      return {
        success: true,
        data: result.data,
        message: result.message
      };
    } catch (error) {
      this.handleError(error);
    }
  }
  @Post('cancelP/:contratNum')
  async cancel(@Param('contratNum', ParseIntPipe) contratNum: number) {
    try {
      const result = await this.paymentGatewayService.cancel(contratNum);

      return {
        success: true,
        data: result.data,
        message: result.message
      };
    } catch (error) {
      this.handleError(error);
    }
  }


  private handleError(error: any) {
    if (error instanceof HttpException) {
      throw new HttpException({
        success: false,
        message: error.message,
        error: this.getErrorCode(error)
      }, error.getStatus());
    }

    throw new BadRequestException({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR'
    });
  }

  private getErrorCode(error: HttpException): string {
    const status = error.getStatus();
    switch(status) {
      case 400: return 'BAD_REQUEST';
      case 404: return 'NOT_FOUND';
      case 409: return 'CONFLICT';
      default: return 'SERVER_ERROR';
    }
  }

  @Post('initiate/:contratNum')
  async initiatePayment(
    @Param('contratNum', ParseIntPipe) contratNum: number,
    @Body() body: { successUrl: string; failUrl: string }
  ) {
    try {
      if (!body.successUrl || !body.failUrl) {
        throw new BadRequestException('Les URLs de retour sont requises');
      }

      const paymentLink = await this.paymentGatewayService.generatePaymentLink(
        contratNum,
        body.successUrl,
        body.failUrl
      );

      return {
        success: true,
        data: {
          paymentLink: paymentLink.paymentLink,
          paymentId: paymentLink.paymentId,
          trackingId: paymentLink.trackingId,
          amount: paymentLink.amount,
          expiration: paymentLink.expiration,
          contratNum: contratNum
        },
        message: 'Lien de paiement généré avec succès'
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException({
          success: false,
          message: error.message,
          error: this.getErrorCode(error)
        }, error.getStatus());
      }
      throw new BadRequestException({
        success: false,
        message: 'Erreur technique',
        error: 'SERVER_ERROR'
      });
    }
  }

 
  @Post('vie/generate')
async generatePaymentVie(
  @Body() paymentData: GeneratePaymentDto
): Promise<{
  success: boolean;
  data: {
    paymentLink: string;
    paymentId: string;
    trackingId: string;
    amount: number;
    expiration?: string;
  };
  message: string;
  timestamp: string;
}> {
  try {
    const payment = await this.paymentGatewayService.generatePaymentLinkVie(
      paymentData.contratNum,
      paymentData.successUrl,
      paymentData.failUrl
    );

    return {
      success: true,
      data: {
        paymentLink: payment.paymentLink,
        paymentId: payment.paymentId,
        trackingId: payment.trackingId,
        amount: payment.amount,
        expiration: payment.expiration,
      },
      message: 'Lien de paiement vie généré avec succès',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    if (error instanceof HttpException) {
      throw new HttpException({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      }, error.getStatus());
    }

    if (error.message.includes('Contrat non trouvé')) {
      throw new HttpException({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      }, HttpStatus.NOT_FOUND);
    }

    if (error.message.includes('montant invalide')) {
      throw new HttpException({
        success: false,
        message: 'Le montant de la cotisation vie n\'est pas valide',
        timestamp: new Date().toISOString()
      }, HttpStatus.BAD_REQUEST);
    }

    throw new HttpException({
      success: false,
      message: 'Erreur lors de la génération du paiement vie',
      timestamp: new Date().toISOString()
    }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

@Post('vie/local')
async createLocalPaymentVie(@Body() paymentData: CreateLocalPaymentDto) {
  try {
    if (!paymentData.contratNum) {
      throw new BadRequestException('Le numéro de contrat vie est requis');
    }
    
    const paymentResult = await this.paymentGatewayService.createLocalPaymentVie(paymentData.contratNum);
    
    return {
      success: true,
      message: 'Paiement local vie créé avec succès',
      data: {
        paymentId: paymentResult.paymentId,
        status: paymentResult.status,
        amount: paymentResult.amount,
        paymentDate: paymentResult.paymentDate,
        contratNum: paymentResult.contratNum,
        paymentType: paymentResult.paymentType
      }
    };
    
  } catch (error) {
    if (error instanceof HttpException) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'PAYMENT_ERROR'
        },
        error.getStatus()
      );
    }
    
    throw new BadRequestException({
      success: false,
      message: 'Erreur technique lors de la création du paiement vie',
      error: 'SERVER_ERROR'
    });
  }
}

@Get('vie/verify/:paymentId')
async verifyPaymentVie(@Param('paymentId') paymentId: string) {
  try {
    const result = await this.paymentGatewayService.verifyPaymentVie(paymentId);

    return {
      success: true,
      data: {
        status: result.status,
        contratNum: result.contratNum,
        amount: result.amount,
        ...(result.paymentDate && { paymentDate: result.paymentDate }),
        ...(result.deleted && { deleted: result.deleted })
      },
      message: result.status === 'PAID' 
        ? 'Payment vie verified successfully' 
        : 'Payment vie verification failed'
    };
  } catch (error) {
    this.handleError(error);
  }
}

@Get('vie/status/:contratNum')
async getPaymentStatusVie(@Param('contratNum', ParseIntPipe) contratNum: number) {
  try {
    const result = await this.paymentGatewayService.getPaymentByContratVie(contratNum);

    if (!result.hasPayment) {
      return {
        success: true,
        data: {
          hasPayment: false,
          status: 'NO_PAYMENT',
          contratNum
        },
        message: 'No payment found for this vie contract'
      };
    }

    return {
      success: true,
      data: {
        hasPayment: true,
        paymentId: result.paymentId,
        trackingId: result.trackingId,
        status: result.status,
        amount: result.amount,
        paymentDate: result.paymentDate,
        contratNum
      },
      message: 'Vie payment status retrieved successfully'
    };
  } catch (error) {
    this.handleError(error);
  }
}

@Post('vie/cancel/:contratNum')
async cancelPaymentVie(@Param('contratNum', ParseIntPipe) contratNum: number) {
  try {
    const result = await this.paymentGatewayService.cancelPaymentVie(contratNum);

    return {
      success: true,
      data: result.data,
      message: result.message
    };
  } catch (error) {
    this.handleError(error);
  }
}

@Post('vie/initiate/:contratNum')
async initiatePaymentVie(
  @Param('contratNum', ParseIntPipe) contratNum: number,
  @Body() body: { successUrl: string; failUrl: string }
) {
  try {
    if (!body.successUrl || !body.failUrl) {
      throw new BadRequestException('Les URLs de retour sont requises');
    }

    const paymentLink = await this.paymentGatewayService.generatePaymentLinkVie(
      contratNum,
      body.successUrl,
      body.failUrl
    );

    return {
      success: true,
      data: {
        paymentLink: paymentLink.paymentLink,
        paymentId: paymentLink.paymentId,
        trackingId: paymentLink.trackingId,
        amount: paymentLink.amount,
        expiration: paymentLink.expiration,
        contratNum: contratNum
      },
      message: 'Lien de paiement vie généré avec succès'
    };
  } catch (error) {
    if (error instanceof HttpException) {
      throw new HttpException({
        success: false,
        message: error.message,
        error: this.getErrorCode(error)
      }, error.getStatus());
    }
    throw new BadRequestException({
      success: false,
      message: 'Erreur technique',
      error: 'SERVER_ERROR'
    });
  }
}
}