import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { CreateMessageUseCase } from 'src/application/use-cases/create-message-use-case';
import { GetMessageHistoryWithUsernameUseCase } from 'src/application/use-cases/get-message-history-with-username.use-case';
import { Message } from 'src/domain/entities/message';
import { UseCaseProxy } from 'src/infrastructure/use-cases-proxy/use-cases-proxy';
import { UseCaseProxyModule } from 'src/infrastructure/use-cases-proxy/use-cases-proxy.module';
import { GetUserFromReq } from '../decorators/get-user-from-req.decorator';
import { CreateMessageRequestDto } from '../dto/message/create-message-request.dto';
import { GetMessageHistoryWithUsernameRequestDto } from '../dto/message/get-message-history-with-username-request.dto';
import { MessageDto } from '../dto/message/get-message-history-with-username-response.dto';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { BaseController } from './base-controller';

@Controller('message')
export class MessageController extends BaseController {
  constructor(
    @Inject(UseCaseProxyModule.CREATE_MESSAGE_USE_CASE_PROXY)
    private readonly _createMessageUseCaseProxy: UseCaseProxy<CreateMessageUseCase>,
    @Inject(UseCaseProxyModule.GET_MESSAGE_HISTORY_WITH_USERNAME_USE_CASE_PROXY)
    private readonly _getMessageHistoryWithUsernameUseCase: UseCaseProxy<GetMessageHistoryWithUsernameUseCase>,
  ) {
    super();
  }

  @Post('create-message')
  @UseGuards(AccessTokenGuard)
  public async getUser(
    @GetUserFromReq('username') senderUsername: string,
    @Body() createMessageDto: CreateMessageRequestDto,
  ): Promise<void> {
    const message = new Message({
      content: createMessageDto.content,
      senderUsername: senderUsername,
      receiverUsername: createMessageDto.receiverUsername,
    });
    const createMessagResult = await this._createMessageUseCaseProxy
      .getInstance()
      .createMessage(message);
    if (createMessagResult.isFailure) {
      this.handleFailedResult(createMessagResult.getError());
    }
    return;
  }

  @Get('get-message-history-with-username')
  @UseGuards(AccessTokenGuard)
  public async getMessageHistoryWithUsername(
    @GetUserFromReq('username') username: string,
    @Body()
    getMessageHistoryWithUsername: GetMessageHistoryWithUsernameRequestDto,
  ): Promise<MessageDto[]> {
    const messageHistoryWithUsernameOrError =
      await this._getMessageHistoryWithUsernameUseCase
        .getInstance()
        .getMessageHistoryWithUsername(
          username,
          getMessageHistoryWithUsername.otherUsername,
        );
    if (messageHistoryWithUsernameOrError.isFailure) {
      this.handleFailedResult(messageHistoryWithUsernameOrError.getError());
    }
    const messageHistoryWithUsername =
      messageHistoryWithUsernameOrError.getValue();
    const getMessageHistoryWithUsernameResponseDto =
      messageHistoryWithUsername.map(
        (message: Message) => new MessageDto(message),
      );
    return getMessageHistoryWithUsernameResponseDto;
  }
}
