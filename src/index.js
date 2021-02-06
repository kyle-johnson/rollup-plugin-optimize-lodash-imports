"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lodashSpecifiersToEs = exports.lodashSpecifiersToCjs = void 0;
const pluginutils_1 = require("@rollup/pluginutils");
const magic_string_1 = __importDefault(require("magic-string"));
const estree_walker_1 = require("estree-walker");
const guards_1 = require("./guards");
const UNCHANGED = null;
function lodashSpecifiersToCjs(base, specifiers) {
    return specifiers.map(({ imported, local }) => `import ${imported.name !== local.name
        ? imported.name + " as " + local.name
        : local.name} from "${base}/${imported.name}";`);
}
exports.lodashSpecifiersToCjs = lodashSpecifiersToCjs;
function lodashSpecifiersToEs(base, specifiers) {
    const isFp = base.endsWith("fp");
    return specifiers.map(({ imported, local }) => `import { ${imported.name !== local.name
        ? imported.name + " as " + local.name
        : local.name} } from "lodash-es${isFp ? "/fp" : ""}";`);
}
exports.lodashSpecifiersToEs = lodashSpecifiersToEs;
function optimizeLodash({ include, exclude, useLodashEs, } = {}) {
    const filter = pluginutils_1.createFilter(include, exclude);
    return {
        name: "optimize-lodash-imports",
        outputOptions(options) {
            var _a;
            if (useLodashEs && options.format !== "es") {
                this.error(`'useLodashEs' is true but the output format is not 'es', it's ${(_a = options.format) !== null && _a !== void 0 ? _a : "undefined"}`);
            }
            return null;
        },
        transform(code, id) {
            const warn = this.warn.bind(this);
            // sometimes we can skip the whole file
            if (!filter(id) || !code.includes("lodash")) {
                return UNCHANGED;
            }
            let ast;
            try {
                ast = this.parse(code);
            }
            catch (error) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                error.message += ` in ${id}`;
                throw error;
            }
            // easy source map generation
            let magicString;
            estree_walker_1.walk(ast, {
                enter(node) {
                    var _a, _b, _c;
                    // top-level node; we need to walk its children to find imports
                    if (guards_1.isProgram(node)) {
                        return;
                    }
                    // skip any nodes that aren't imports (this skips most everything)
                    if (!guards_1.isImportDeclaration(node)) {
                        this.skip();
                        return;
                    }
                    // narrow-in on lodash imports we care about
                    if (node.source.value !== "lodash" &&
                        node.source.value !== "lodash/fp") {
                        this.skip();
                        return;
                    }
                    // transform specific "lodash" and "lodash/fp" imports such as:
                    // import { isNil } from "lodash";
                    if (guards_1.isImportSpecifierArray(node.specifiers)) {
                        magicString = magicString !== null && magicString !== void 0 ? magicString : new magic_string_1.default(code);
                        // modify
                        const imports = useLodashEs
                            ? lodashSpecifiersToEs(node.source.value, node.specifiers)
                            : lodashSpecifiersToCjs(node.source.value, node.specifiers);
                        // write
                        magicString.overwrite(node.start, node.end, imports.join("\n"));
                        // no need to dig deeper
                        this.skip();
                    }
                    else {
                        warn(`Detected a default lodash or lodash/fp import within ${id} on line ${(_c = (_b = (_a = node.loc) === null || _a === void 0 ? void 0 : _a.start) === null || _b === void 0 ? void 0 : _b.line) !== null && _c !== void 0 ? _c : "unknown"}.\nThis import cannot be optimized by optimize-lodash-imports.`);
                    }
                },
            });
            if (!magicString) {
                return UNCHANGED;
            }
            return {
                code: magicString.toString(),
                map: magicString.generateMap({
                    file: id,
                    includeContent: true,
                    hires: true,
                }),
            };
        },
    };
}
exports.default = optimizeLodash;
