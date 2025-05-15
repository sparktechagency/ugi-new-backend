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
exports.businessServiceService = void 0;
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const promises_1 = require("fs/promises");
const promises_2 = require("fs/promises");
const service_model_1 = __importDefault(require("./service.model"));
const category_model_1 = require("../category/category.model");
const subCategory_model_1 = __importDefault(require("../subCategory/subCategory.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const createBusinessServiceService = (files, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield category_model_1.Category.findById(payload.categoryId);
    if (!category) {
        throw new AppError_1.default(400, 'Category not found');
    }
    const subCategory = yield subCategory_model_1.default.findById(payload.subCategoryId);
    if (!subCategory) {
        throw new AppError_1.default(400, 'Sub Category not found');
    }
    if (files && files['serviceImage'] && files['serviceImage'][0]) {
        payload['serviceImage'] = files['serviceImage'][0].path.replace(/^public[\\/]/, '');
    }
    const result = yield service_model_1.default.create(payload);
    if (!result) {
        const imagePath = `public/${payload.serviceImage}`;
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
const getAllBusinessServiceByBusinessId = (query, businessId) => __awaiter(void 0, void 0, void 0, function* () {
    const businessServiceQuery = new QueryBuilder_1.default(service_model_1.default.find({ businessUserId: businessId }), query)
        .search([''])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield businessServiceQuery.modelQuery;
    const meta = yield businessServiceQuery.countTotal();
    return { meta, result };
});
const getAllBusinessService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const businessServiceQuery = new QueryBuilder_1.default(service_model_1.default.find({}).select('businessId').populate('businessId'), query)
        .search([''])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield businessServiceQuery.modelQuery;
    const meta = yield businessServiceQuery.countTotal();
    return { meta, result };
});
const getAllAdminServiceByBusinessId = (businessId) => __awaiter(void 0, void 0, void 0, function* () {
    const businessIdx = new mongoose_1.default.Types.ObjectId(businessId);
    const service = yield service_model_1.default.find({ businessUserId: businessIdx });
    return service;
});
const getAllAdminByService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const businessServiceQuery = new QueryBuilder_1.default(service_model_1.default.find({}).populate('businessUserId'), query)
        .search([''])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield businessServiceQuery.modelQuery;
    const meta = yield businessServiceQuery.countTotal();
    return { meta, result };
});
const getSingleBusinessServiceService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield service_model_1.default.findById(id);
    return result;
});
const updateBusinessServiceService = (id, files, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('id', id);
    // console.log('payload', { payload });
    // Check if the document exists
    const existingBusinessService = yield service_model_1.default.findById(id);
    if (!existingBusinessService) {
        throw new AppError_1.default(404, 'BusinessService not found!');
    }
    // Validate files and process image
    if (files && files['serviceImage'] && files['serviceImage'][0]) {
        const BusinessServiceImage = files['serviceImage'][0];
        payload.serviceImage = BusinessServiceImage.path.replace(/^public[\\/]/, '');
    }
    const result = yield service_model_1.default.findByIdAndUpdate(id, payload, {
        new: true,
    });
    if (result) {
        const imagePath = `public/${existingBusinessService.serviceImage}`;
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
const deletedBusinessServiceService = (id, businessId) => __awaiter(void 0, void 0, void 0, function* () {
    const existingBusinessService = yield service_model_1.default.findById(id);
    if (!existingBusinessService) {
        throw new AppError_1.default(404, 'BusinessService not found!');
    }
    const business = yield service_model_1.default.findOne({
        businessUserId: businessId,
    });
    if (!business) {
        throw new AppError_1.default(404, 'Business user not found!');
    }
    const result = yield service_model_1.default.findByIdAndDelete(id);
    if (result) {
        const imagePath = `public/${existingBusinessService.serviceImage}`;
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
exports.businessServiceService = {
    createBusinessServiceService,
    getAllBusinessServiceByBusinessId,
    getAllBusinessService,
    getAllAdminServiceByBusinessId,
    getAllAdminByService,
    getSingleBusinessServiceService,
    deletedBusinessServiceService,
    updateBusinessServiceService,
};
