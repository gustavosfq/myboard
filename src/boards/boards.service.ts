import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Board, BoardDocument } from './schemas/board.schema';
import { Postit, PostitDocument } from '../postits/schemas/postit.schema';
import { CreateBoardDto, ShareBoardDto } from './dto/board.dto';

@Injectable()
export class BoardsService {
  private readonly logger = new Logger('BoardsService');

  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    @InjectModel(Postit.name) private postitModel: Model<PostitDocument>
  ) {}

  async create(createBoardDto: CreateBoardDto, userId: string): Promise<Board> {
    const board = new this.boardModel({
      ...createBoardDto,
      owner: new Types.ObjectId(userId),
    });
    return board.save();
  }

  async findAll(userId: string): Promise<Board[]> {
    return this.boardModel
      .find({
        $or: [
          { owner: new Types.ObjectId(userId) },
          { sharedWith: new Types.ObjectId(userId) },
        ],
        isActive: true,
      })
      .populate('owner', 'name email picture')
      .populate('sharedWith', 'name email picture')
      .exec();
  }

  async findOne(id: string, userId: string): Promise<Board> {
    const board = await this.boardModel
      .findById(id)
      .populate('owner', 'name email picture')
      .populate('sharedWith', 'name email picture')
      .exec();

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Check if user has access
    const userObjectId = new Types.ObjectId(userId);
    const hasAccess =
      board.owner._id.toString() == userId ||
      board.sharedWith.some((id) => id.toString() === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this board');
    }

    return board;
  }

  async update(id: string, updateData: Partial<CreateBoardDto>, userId: string): Promise<Board> {
    const board = await this.boardModel.findById(id);

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (board.owner.toString() !== userId) {
      throw new ForbiddenException('Only the owner can update this board');
    }

    Object.assign(board, updateData);
    return board.save();
  }

  async share(id: string, shareBoardDto: ShareBoardDto, userId: string): Promise<Board> {
    const board = await this.boardModel.findById(id);

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (board.owner.toString() !== userId) {
      throw new ForbiddenException('Only the owner can share this board');
    }

    const userObjectIds = shareBoardDto.userIds.map((id) => new Types.ObjectId(id));
    board.sharedWith = userObjectIds;
    return board.save();
  }

  async delete(id: string, userId: string): Promise<void> {
    const board = await this.boardModel.findById(id);

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (board.owner.toString() !== userId) {
      throw new ForbiddenException('Only the owner can delete this board');
    }

    board.isActive = false;
    await board.save();
  }

  async getBoardWithPostits(id: string, userId: string): Promise<{ board: Board; postits: Postit[] }> {
    this.logger.log(`📋 Getting board with post-its - Board ID: ${id}, User: ${userId}`);
    
    try {
      // Verificar acceso al board
      const board = await this.findOne(id, userId);
      
      // Obtener todos los post-its del board
      const postits = await this.postitModel
        .find({ 
          board: new Types.ObjectId(id),
          isActive: true 
        })
        .populate('author', 'name email picture')
        .sort({ zIndex: 1 }) // Ordenar por z-index para el canvas
        .exec();

      this.logger.log(`✅ Found ${postits.length} post-its for board: ${id}`);
      
      return {
        board,
        postits
      };
    } catch (error) {
      this.logger.error(`❌ Failed to get board with post-its: ${error.message}`, error.stack);
      throw error;
    }
  }

  async checkAccess(boardId: string, userId: string): Promise<boolean> {
    const board = await this.boardModel.findById(boardId);
    if (!board) return false;

    return (
      board.owner.toString() === userId ||
      board.sharedWith.some((id) => id.toString() === userId)
    );
  }
}
