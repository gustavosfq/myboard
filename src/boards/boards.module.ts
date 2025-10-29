import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { Board, BoardSchema } from './schemas/board.schema';
import { Postit, PostitSchema } from '../postits/schemas/postit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Board.name, schema: BoardSchema },
      { name: Postit.name, schema: PostitSchema }
    ])
  ],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsService],
})
export class BoardsModule {}
