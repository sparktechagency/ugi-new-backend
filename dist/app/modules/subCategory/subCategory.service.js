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
exports.subCategoryService = void 0;
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const subCategory_model_1 = __importDefault(require("./subCategory.model"));
const createSubCategoryService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield subCategory_model_1.default.create(payload);
    return result;
});
const getAllSubCategoryService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("query", query);
    const subCategoryQuery = new QueryBuilder_1.default(subCategory_model_1.default.find({}), query)
        .search(['subCategoryname'])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield subCategoryQuery.modelQuery;
    const meta = yield subCategoryQuery.countTotal();
    return { meta, result };
});
const getSingleSubCategoryService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield subCategory_model_1.default.findById(id);
    return result;
});
const deletedSubCategoryService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingSubCategory = yield subCategory_model_1.default.findById(id);
    if (!existingSubCategory) {
        throw new AppError_1.default(404, 'Sub Category not found!');
    }
    const result = yield subCategory_model_1.default.findByIdAndDelete(id);
    return result;
});
const updateSubCategoryService = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingSubCategory = yield subCategory_model_1.default.findById(id);
    if (!existingSubCategory) {
        throw new AppError_1.default(404, 'Sub Category not found!');
    }
    const result = yield subCategory_model_1.default.findByIdAndUpdate(id, payload, {
        new: true,
    });
    return result;
});
exports.subCategoryService = {
    createSubCategoryService,
    getAllSubCategoryService,
    getSingleSubCategoryService,
    deletedSubCategoryService,
    updateSubCategoryService,
};
