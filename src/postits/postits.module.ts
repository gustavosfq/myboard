import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostitsController } from './postits.controller';
import { PostitsService } from './postits.service';
import { Postit, PostitSchema } from './schemas/postit.schema';
import { BoardsModule } from '../boards/boards.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Postit.name, schema: PostitSchema }]),
    BoardsModule,
  ],
  controllers: [PostitsController],
  providers: [PostitsService],
  exports: [PostitsService],
})
export class PostitsModule {}
