"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pnlReportController_js_1 = require("../controllers/pnlReportController.js");
const router = (0, express_1.Router)();
router.get('/pnl-report', pnlReportController_js_1.getPnlReport);
exports.default = router;
