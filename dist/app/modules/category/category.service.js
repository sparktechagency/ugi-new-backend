"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryService = void 0;
const AppError_1 = __importDefault(require("../../error/AppError"));
const category_model_1 = require("./category.model");
const promises_1 = require("fs/promises");
const promises_2 = require("fs/promises");
const createCategoryService = (files, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (files && files['image'] && files['image'][0]) {
        payload['image'] = files['image'][0].path.replace(/^public[\\/]/, '');
    }
    const result = yield category_model_1.Category.create(payload);
    if (!result) {
        const imagePath = `public/${payload.image}`;
        // console.log('File path to delete:', imagePath);
        try {
            yield (0, promises_1.access)(imagePath); // Check if the file exists
            // console.log('File exists, proceeding to delete:', imagePath);
            yield (0, promises_2.unlink)(imagePath);
            // console.log('File successfully deleted:', imagePath);
        }
        catch (error) {
            console.error(`Error handling file at ${imagePath}:`, error.message);
        }
    }
    return result;
});
// const getAllCategoryService = async (query: Record<string, unknown>) => {
//   const ServiceBookingQuery = new QueryBuilder(Category.find({}), query)
//     .search([''])
//     .filter()
//     .sort()
//     .paginate()
//     .fields();
//   const result = await ServiceBookingQuery.modelQuery;
//   const meta = await ServiceBookingQuery.countTotal();
//   return { meta, result };
// };
const getAllCategoryService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const categoryQuery = yield category_model_1.Category.aggregate([
        {
            $lookup: {
                from: 'services',
                localField: '_id',
                foreignField: 'categoryId',
                as: 'services',
            },
        },
        {
            $addFields: {
                addPrice: {
                    $cond: {
                        if: { $gt: [{ $size: '$services' }, 0] },
                        then: {
                            $min: {
                                $map: {
                                    input: '$services',
                                    as: 'service',
                                    in: '$$service.servicePrice',
                                },
                            },
                        },
                        else: 0,
                    },
                },
            },
        },
        {
            $group: {
                _id: '$_id',
                name: { $first: '$name' },
                image: { $first: '$image' },
                addPrice: { $first: '$addPrice' },
            },
        },
        {
            $project: {
                _id: 1,
                name: 1,
                image: 1,
                addPrice: 1,
            },
        },
        { $sort: { name: 1 } },
        { $skip: skip },
        { $limit: limit },
    ]);
    const totalDocuments = yield category_model_1.Category.countDocuments({});
    const totalPage = Math.ceil(totalDocuments / limit);
    const meta = {
        page,
        limit,
        total: totalDocuments,
        totalPage,
    };
    // console.log({ categoryQuery, meta });
    return { meta, categoryQuery };
});
const getSingleCategoryService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield category_model_1.Category.findById(id);
    return result;
});
const deletedCategoryService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingCategory = yield category_model_1.Category.findById(id);
    if (!existingCategory) {
        throw new AppError_1.default(404, 'Category not found!');
    }
    const result = yield category_model_1.Category.findByIdAndDelete(id);
    if (result) {
        const imagePath = `public/${existingCategory.image}`;
        // console.log('File path to delete:', imagePath);
        try {
            yield (0, promises_1.access)(imagePath);
            // console.log('File exists, proceeding to delete:', imagePath);
            yield (0, promises_2.unlink)(imagePath);
            // console.log('File successfully deleted:', imagePath);
        }
        catch (error) {
            console.error(`Error handling file at ${imagePath}:`, error.message);
        }
    }
    return result;
});
const updateCategoryService = (id, files, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('id', id);
    // console.log('payload', { payload });
    // Check if the document exists
    const existingCategory = yield category_model_1.Category.findById(id);
    if (!existingCategory) {
        throw new AppError_1.default(404, 'Category not found!');
    }
    // Validate files and process image
    if (files && files['image'] && files['image'][0]) {
        const categoryImage = files['image'][0];
        payload.image = categoryImage.path.replace(/^public[\\/]/, '');
    }
    const result = yield category_model_1.Category.findByIdAndUpdate(id, payload, {
        new: true,
    });
    if (result) {
        const imagePath = `public/${existingCategory.image}`;
        // console.log('File path to delete:', imagePath);
        try {
            yield (0, promises_1.access)(imagePath); // Check if the file exists
            // console.log('File exists, proceeding to delete:', imagePath);
            yield (0, promises_2.unlink)(imagePath);
            // console.log('File successfully deleted:', imagePath);
        }
        catch (error) {
            console.error(`Error handling file at ${imagePath}:`, error.message);
        }
    }
    // console.log({ result });
    return result;
});
exports.categoryService = {
    createCategoryService,
    getAllCategoryService,
    getSingleCategoryService,
    deletedCategoryService,
    updateCategoryService,
};
