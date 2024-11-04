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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateShopId = exports.findLastShopId = void 0;
/* eslint-disable prefer-const */
const shop_models_1 = require("../shop/shop.models");
const findLastShopId = () => __awaiter(void 0, void 0, void 0, function* () {
    const lastShop = yield shop_models_1.Shop.findOne({}, { id: 1, _id: 0 })
        .sort({ createdAt: -1 })
        .lean();
    return lastShop === null || lastShop === void 0 ? void 0 : lastShop.id;
});
exports.findLastShopId = findLastShopId;
const generateShopId = () => __awaiter(void 0, void 0, void 0, function* () {
    const currentId = (yield (0, exports.findLastShopId)()) || (0).toString().padStart(5, '0');
    let incrementedId = (parseInt(currentId) + 1).toString().padStart(5, '0');
    return incrementedId;
});
exports.generateShopId = generateShopId;
