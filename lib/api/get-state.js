"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _ccContext = _interopRequireDefault(require("../cc-context"));

var _default = function _default(module) {
  return _ccContext["default"].store.getState(module);
};

exports["default"] = _default;