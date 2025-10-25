import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Postit, PostitDocument } from './schemas/postit.schema';
import { CreatePostitDto, UpdatePostitDto } from './dto/postit.dto';
import { BoardsService } from '../boards/boards.service';

@Injectable()
export class PostitsService {
  constructor(
    @InjectModel(Postit.name) private postitModel: Model<PostitDocument>,
    private boardsService: BoardsService,
  ) {}

  async create(createPostitDto: CreatePostitDto, userId: string): Promise<Postit> {
    // Check if user has access to the board
    const hasAccess = await this.boardsService.checkAccess(createPostitDto.boardId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this board');
    }

    const postit = new this.postitModel({
      ...createPostitDto,
      boardId: new Types.ObjectId(createPostitDto.boardId),
      createdBy: new Types.ObjectId(userId),
      lastModifiedBy: new Types.ObjectId(userId),
    });

    return postit.save();
  }

  async findByBoard(boardId: string, userId: string): Promise<Postit[]> {
    // Check if user has access to the board
    const hasAccess = await this.boardsService.checkAccess(boardId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this board');
    }

    return this.postitModel
      .find({
        boardId: new Types.ObjectId(boardId),
        isActive: true,
      })
      .populate('createdBy', 'name email picture')
      .populate('lastModifiedBy', 'name email picture')
      .sort({ zIndex: 1 })
      .exec();
  }

  async findOne(id: string, userId: string): Promise<Postit> {
    const postit = await this.postitModel
      .findById(id)
      .populate('createdBy', 'name email picture')
      .populate('lastModifiedBy', 'name email picture')
      .exec();

    if (!postit) {
      throw new NotFoundException('Post-it not found');
    }

    // Check if user has access to the board
    const hasAccess = await this.boardsService.checkAccess(
      postit.boardId.toString(),
      userId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this post-it');
    }

    return postit;
  }

  async update(id: string, updatePostitDto: UpdatePostitDto, userId: string): Promise<Postit> {
    const postit = await this.postitModel.findById(id);

    if (!postit) {
      throw new NotFoundException('Post-it not found');
    }

    // Check if user has access to the board
    const hasAccess = await this.boardsService.checkAccess(
      postit.boardId.toString(),
      userId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this post-it');
    }

    Object.assign(postit, updatePostitDto);
    postit.lastModifiedBy = new Types.ObjectId(userId);
    return postit.save();
  }

  async delete(id: string, userId: string): Promise<void> {
    const postit = await this.postitModel.findById(id);

    if (!postit) {
      throw new NotFoundException('Post-it not found');
    }

    // Check if user has access to the board
    const hasAccess = await this.boardsService.checkAccess(
      postit.boardId.toString(),
      userId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this post-it');
    }

    postit.isActive = false;
    await postit.save();
  }
}
