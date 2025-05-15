"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const SubCategorySchema = new mongoose_1.default.Schema({
    subCategoryname: {
        type: String,
        required: true,
    },
    categoryName: {
        type: String,
        required: true,
    },
    categoryId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
}, {
    timestamps: true,
});
const SubCategory = mongoose_1.default.model('SubCategory', SubCategorySchema);
exports.default = SubCategory;
