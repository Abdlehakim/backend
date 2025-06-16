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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const createOrUpdatePermissions_1 = require("./scripts/createOrUpdatePermissions");
const initRoles_1 = require("./scripts/initRoles");
const initSuperAdmin_1 = __importDefault(require("./scripts/initSuperAdmin"));
// Load environment variables
dotenv_1.default.config();
// Connect to the database (this runs db.ts)
require("./db");
// Initialize app
const app = (0, express_1.default)();
// 1) Use all required middleware *before* routes
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: ['http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
}));
const port = process.env.PORT || 3000;
// -----------------Frontend Import ---------------------- //
//Import route modules auth Client
const signin_1 = __importDefault(require("./routes/client/auth/signin"));
const auth_1 = __importDefault(require("./routes/client/auth/auth"));
const signup_1 = __importDefault(require("./routes/client/auth/signup"));
const updateClientdetails_1 = __importDefault(require("./routes/client/settings/updateClientdetails"));
// Import route Reviews
const PostProductReviews_1 = __importDefault(require("./routes/products/PostProductReviews"));
const SimilarProduct_1 = __importDefault(require("./routes/products/SimilarProduct"));
// Import route modules
const productsRoutes_1 = __importDefault(require("./routes/homePage/productsRoutes"));
const categoriesRoutes_1 = __importDefault(require("./routes/NavMenu/categoriesRoutes"));
const brandsRoutes_1 = __importDefault(require("./routes/homePage/brandsRoutes"));
const storesRoutes_1 = __importDefault(require("./routes/homePage/storesRoutes"));
const contactUsRoutes_1 = __importDefault(require("./routes/NavMenu/contactUsRoutes"));
const HomeBanner_1 = __importDefault(require("./routes/homePage/HomeBanner"));
const categorieSubCategoriePage_1 = __importDefault(require("./routes/NavMenu/categorieSubCategoriePage"));
const ProductPromotion_1 = __importDefault(require("./routes/NavMenu/ProductPromotion"));
const ProductCollection_1 = __importDefault(require("./routes/NavMenu/ProductCollection"));
const BestProductCollection_1 = __importDefault(require("./routes/NavMenu/BestProductCollection"));
const MainProductSection_1 = __importDefault(require("./routes/products/MainProductSection"));
const ProductDetails_1 = __importDefault(require("./routes/products/ProductDetails"));
const ProductReviews_1 = __importDefault(require("./routes/products/ProductReviews"));
//Import route Blog Model
const postsRoutes_1 = __importDefault(require("./routes/blog/postsRoutes"));
const PostCardData_1 = __importDefault(require("./routes/blog/PostCardData"));
const PostCardDataByCategorie_1 = __importDefault(require("./routes/blog/PostCardDataByCategorie"));
//Import route Client
const getOrderByRef_1 = __importDefault(require("./routes/client/order/getOrderByRef"));
const postOrderClient_1 = __importDefault(require("./routes/client/order/postOrderClient"));
const getOrdersByClient_1 = __importDefault(require("./routes/client/order/getOrdersByClient"));
const getAddress_1 = __importDefault(require("./routes/client/address/getAddress"));
const PostAddress_1 = __importDefault(require("./routes/client/address/PostAddress"));
const updateAddressById_1 = __importDefault(require("./routes/client/address/updateAddressById"));
const deleteAddress_1 = __importDefault(require("./routes/client/address/deleteAddress"));
//---------------Frontendadmin Import--------------------//
const dashboardSignin_1 = __importDefault(require("./routes/dashboardadmin/users/dashboardSignin"));
const createUser_1 = __importDefault(require("./routes/dashboardadmin/users/createUser"));
const deleteUser_1 = __importDefault(require("./routes/dashboardadmin/users/deleteUser"));
const dashboardAuth_1 = __importDefault(require("./routes/dashboardadmin/users/dashboardAuth"));
const getAllUsersWithRole_1 = __importDefault(require("./routes/dashboardadmin/users/getAllUsersWithRole"));
const createRoles_1 = __importDefault(require("./routes/dashboardadmin/roles/createRoles"));
const getAllRoles_1 = __importDefault(require("./routes/dashboardadmin/roles/getAllRoles"));
const updateUserRole_1 = __importDefault(require("./routes/dashboardadmin/roles/updateUserRole"));
const deleteRoles_1 = __importDefault(require("./routes/dashboardadmin/roles/deleteRoles"));
const getAllPermission_1 = __importDefault(require("./routes/dashboardadmin/roles/getAllPermission"));
const updateRolePermissions_1 = __importDefault(require("./routes/dashboardadmin/roles/updateRolePermissions"));
const getAllClient_1 = __importDefault(require("./routes/dashboardadmin/client/getAllClient"));
const deleteClient_1 = __importDefault(require("./routes/dashboardadmin/client/deleteClient"));
const getAllOrders_1 = __importDefault(require("./routes/dashboardadmin/orders/getAllOrders"));
// website Data
// homepage routes
const createhomePageData_1 = __importDefault(require("./routes/dashboardadmin/website/homepage/createhomePageData"));
const gethomePageData_1 = __importDefault(require("./routes/dashboardadmin/website/homepage/gethomePageData"));
const updatehomePageData_1 = __importDefault(require("./routes/dashboardadmin/website/homepage/updatehomePageData"));
// company-info routes
const createCompanyInfo_1 = __importDefault(require("./routes/dashboardadmin/website/company-info/createCompanyInfo"));
const getCompanyInfo_1 = __importDefault(require("./routes/dashboardadmin/website/company-info/getCompanyInfo"));
const updateCompanyInfo_1 = __importDefault(require("./routes/dashboardadmin/website/company-info/updateCompanyInfo"));
// --- banner routes-----------------------------------------
const createBanners_1 = __importDefault(require("./routes/dashboardadmin/website/banners/createBanners"));
const getBanners_1 = __importDefault(require("./routes/dashboardadmin/website/banners/getBanners"));
const updateBanners_1 = __importDefault(require("./routes/dashboardadmin/website/banners/updateBanners"));
// stock
//product
const addNewProduct_1 = __importDefault(require("./routes/dashboardadmin/stock/allproducts/addNewProduct"));
const deleteProduct_1 = __importDefault(require("./routes/dashboardadmin/stock/allproducts/deleteProduct"));
const getAllProducts_1 = __importDefault(require("./routes/dashboardadmin/stock/allproducts/getAllProducts"));
const updateProduct_1 = __importDefault(require("./routes/dashboardadmin/stock/allproducts/updateProduct"));
const getProductById_1 = __importDefault(require("./routes/dashboardadmin/stock/allproducts/getProductById"));
// ProductAttribute
const addNewProductAttribute_1 = __importDefault(require("./routes/dashboardadmin/stock/productattribute/addNewProductAttribute"));
const deleteProductAttribute_1 = __importDefault(require("./routes/dashboardadmin/stock/productattribute/deleteProductAttribute"));
const getAllProductAttribute_1 = __importDefault(require("./routes/dashboardadmin/stock/productattribute/getAllProductAttribute"));
const getProductAttributeById_1 = __importDefault(require("./routes/dashboardadmin/stock/productattribute/getProductAttributeById"));
const updateProductAttribute_1 = __importDefault(require("./routes/dashboardadmin/stock/productattribute/updateProductAttribute"));
// brands
//--------------------------------------------------
const addNewBrand_1 = __importDefault(require("./routes/dashboardadmin/stock/brands/addNewBrand"));
const deleteBrand_1 = __importDefault(require("./routes/dashboardadmin/stock/brands/deleteBrand"));
const getAllBrands_1 = __importDefault(require("./routes/dashboardadmin/stock/brands/getAllBrands"));
const updateBrand_1 = __importDefault(require("./routes/dashboardadmin/stock/brands/updateBrand"));
const getBrandById_1 = __importDefault(require("./routes/dashboardadmin/stock/brands/getBrandById"));
// categories
//--------------------------------------------------
const addNewCategorie_1 = __importDefault(require("./routes/dashboardadmin/stock/categories/addNewCategorie"));
const deleteCategorie_1 = __importDefault(require("./routes/dashboardadmin/stock/categories/deleteCategorie"));
const getAllCategories_1 = __importDefault(require("./routes/dashboardadmin/stock/categories/getAllCategories"));
const updateCategorie_1 = __importDefault(require("./routes/dashboardadmin/stock/categories/updateCategorie"));
const getCategorieById_1 = __importDefault(require("./routes/dashboardadmin/stock/categories/getCategorieById"));
// sub-categories
//--------------------------------------------------
const addNewSubCategorie_1 = __importDefault(require("./routes/dashboardadmin/stock/subcategories/addNewSubCategorie"));
const deleteSubCategorie_1 = __importDefault(require("./routes/dashboardadmin/stock/subcategories/deleteSubCategorie"));
const getAllSubCategories_1 = __importDefault(require("./routes/dashboardadmin/stock/subcategories/getAllSubCategories"));
const updateSubCategorie_1 = __importDefault(require("./routes/dashboardadmin/stock/subcategories/updateSubCategorie"));
const getSubCategorieById_1 = __importDefault(require("./routes/dashboardadmin/stock/subcategories/getSubCategorieById"));
// boutiques
//--------------------------------------------------
const addNewBoutique_1 = __importDefault(require("./routes/dashboardadmin/stock/boutiques/addNewBoutique"));
const deleteBoutique_1 = __importDefault(require("./routes/dashboardadmin/stock/boutiques/deleteBoutique"));
const getAllBoutiques_1 = __importDefault(require("./routes/dashboardadmin/stock/boutiques/getAllBoutiques"));
const updateBoutique_1 = __importDefault(require("./routes/dashboardadmin/stock/boutiques/updateBoutique"));
const getBoutiqueById_1 = __importDefault(require("./routes/dashboardadmin/stock/boutiques/getBoutiqueById"));
// blog
//-------------------PostCategorie-------------------------------
const createPostCategorie_1 = __importDefault(require("./routes/dashboardadmin/blog/postcategorie/createPostCategorie"));
const deletePostCategorie_1 = __importDefault(require("./routes/dashboardadmin/blog/postcategorie/deletePostCategorie"));
const getAllPostCategorie_1 = __importDefault(require("./routes/dashboardadmin/blog/postcategorie/getAllPostCategorie"));
const updatePostCategorie_1 = __importDefault(require("./routes/dashboardadmin/blog/postcategorie/updatePostCategorie"));
const getPostCategorieById_1 = __importDefault(require("./routes/dashboardadmin/blog/postcategorie/getPostCategorieById"));
//-----------------------PostSubCategorie---------------------------
const createPostSubCategorie_1 = __importDefault(require("./routes/dashboardadmin/blog/postsubcategorie/createPostSubCategorie"));
const deletePostSubCategorie_1 = __importDefault(require("./routes/dashboardadmin/blog/postsubcategorie/deletePostSubCategorie"));
const getAllPostSubCategorie_1 = __importDefault(require("./routes/dashboardadmin/blog/postsubcategorie/getAllPostSubCategorie"));
const updatePostSubCategorie_1 = __importDefault(require("./routes/dashboardadmin/blog/postsubcategorie/updatePostSubCategorie"));
const getPostSubCategorieById_1 = __importDefault(require("./routes/dashboardadmin/blog/postsubcategorie/getPostSubCategorieById"));
const getPostSubCategroietByParent_1 = __importDefault(require("./routes/dashboardadmin/blog/postsubcategorie/getPostSubCategroietByParent"));
//-----------------------Post---------------------------
const createPost_1 = __importDefault(require("./routes/dashboardadmin/blog/post/createPost"));
const getAllPost_1 = __importDefault(require("./routes/dashboardadmin/blog/post/getAllPost"));
const updatePost_1 = __importDefault(require("./routes/dashboardadmin/blog/post/updatePost"));
const getPostById_1 = __importDefault(require("./routes/dashboardadmin/blog/post/getPostById"));
const deletePost_1 = __importDefault(require("./routes/dashboardadmin/blog/post/deletePost"));
// -----------------Frontend ------------------------ //
// Client Auth
app.use('/api/signin', signin_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/signup', signup_1.default);
app.use('/api/clientSetting/', updateClientdetails_1.default);
// Reviews
app.use('/api/reviews', PostProductReviews_1.default);
// Client home
app.use('/api/products', productsRoutes_1.default);
app.use('/api/categories', categoriesRoutes_1.default);
app.use('/api/brands', brandsRoutes_1.default);
app.use('/api/store', storesRoutes_1.default);
app.use('/api/HomePageBanner', HomeBanner_1.default);
app.use('/api/products/SimilarProduct', SimilarProduct_1.default);
app.use('/api/products/MainProductSection', MainProductSection_1.default);
app.use('/api/products/ProductDetails', ProductDetails_1.default);
app.use('/api/products/ProductReviews', ProductReviews_1.default);
// NavMenu
app.use('/api/NavMenu/categorieSubCategoriePage', categorieSubCategoriePage_1.default);
app.use('/api/NavMenu/contactus', contactUsRoutes_1.default);
app.use('/api/NavMenu/ProductPromotion', ProductPromotion_1.default);
app.use('/api/NavMenu/ProductCollection', ProductCollection_1.default);
app.use('/api/NavMenu/BestProductCollection', BestProductCollection_1.default);
// Blog
app.use('/api/Blog', postsRoutes_1.default);
app.use('/api/Blog', PostCardData_1.default);
app.use('/api/Blog', PostCardDataByCategorie_1.default);
// Client
app.use('/api/client/order', getOrderByRef_1.default);
app.use('/api/client/order', postOrderClient_1.default);
app.use('/api/client/order', getOrdersByClient_1.default);
app.use('/api/client/address', getAddress_1.default);
app.use('/api/client/address', PostAddress_1.default);
app.use('/api/client/address', updateAddressById_1.default);
app.use('/api/client/address', deleteAddress_1.default);
// -----------------Frontendadmin ------------------------ //
// DashboardUser Auth
app.use('/api/signindashboardadmin', dashboardSignin_1.default);
app.use('/api/dashboardAuth', dashboardAuth_1.default);
app.use("/api/dashboardadmin/users", deleteUser_1.default);
app.use('/api/dashboardadmin/users', createUser_1.default);
app.use('/api/dashboardadmin/getAllPermission', getAllPermission_1.default);
app.use('/api/dashboardadmin/getAllUsersWithRole', getAllUsersWithRole_1.default);
app.use('/api/dashboardadmin/roles', createRoles_1.default);
app.use("/api/dashboardadmin/roles", getAllRoles_1.default);
app.use("/api/dashboardadmin/roles", updateUserRole_1.default);
app.use("/api/dashboardadmin/roles", deleteRoles_1.default);
app.use("/api/dashboardadmin/roles", updateRolePermissions_1.default);
// client
app.use("/api/dashboardadmin/client", getAllClient_1.default);
app.use("/api/dashboardadmin/client", deleteClient_1.default);
// orders
app.use('/api/dashboardadmin/orders', getAllOrders_1.default);
// stock
// product
app.use('/api/dashboardadmin/stock/products', addNewProduct_1.default);
app.use('/api/dashboardadmin/stock/products', deleteProduct_1.default);
app.use('/api/dashboardadmin/stock/products', getAllProducts_1.default);
app.use('/api/dashboardadmin/stock/products', updateProduct_1.default);
app.use('/api/dashboardadmin/stock/products', getProductById_1.default);
app.use('/api/dashboardadmin/stock/productattribute', addNewProductAttribute_1.default);
app.use('/api/dashboardadmin/stock/productattribute', getAllProductAttribute_1.default);
app.use('/api/dashboardadmin/stock/productattribute', deleteProductAttribute_1.default);
app.use('/api/dashboardadmin/stock/productattribute', getProductAttributeById_1.default);
app.use('/api/dashboardadmin/stock/productattribute', updateProductAttribute_1.default);
// brands
app.use("/api/dashboardadmin/stock/brands", addNewBrand_1.default);
app.use("/api/dashboardadmin/stock/brands", deleteBrand_1.default);
app.use("/api/dashboardadmin/stock/brands", getAllBrands_1.default);
app.use("/api/dashboardadmin/stock/brands", updateBrand_1.default);
app.use("/api/dashboardadmin/stock/brands", getBrandById_1.default);
// categories
app.use("/api/dashboardadmin/stock/categories", addNewCategorie_1.default);
app.use("/api/dashboardadmin/stock/categories", deleteCategorie_1.default);
app.use("/api/dashboardadmin/stock/categories", getAllCategories_1.default);
app.use("/api/dashboardadmin/stock/categories", updateCategorie_1.default);
app.use("/api/dashboardadmin/stock/categories", getCategorieById_1.default);
// sub-categories
app.use("/api/dashboardadmin/stock/subcategories", addNewSubCategorie_1.default);
app.use("/api/dashboardadmin/stock/subcategories", deleteSubCategorie_1.default);
app.use("/api/dashboardadmin/stock/subcategories", getAllSubCategories_1.default);
app.use("/api/dashboardadmin/stock/subcategories", updateSubCategorie_1.default);
app.use("/api/dashboardadmin/stock/subcategories", getSubCategorieById_1.default);
// boutiques
app.use("/api/dashboardadmin/stock/boutiques", addNewBoutique_1.default);
app.use("/api/dashboardadmin/stock/boutiques", deleteBoutique_1.default);
app.use("/api/dashboardadmin/stock/boutiques", getAllBoutiques_1.default);
app.use("/api/dashboardadmin/stock/boutiques", updateBoutique_1.default);
app.use("/api/dashboardadmin/stock/boutiques", getBoutiqueById_1.default);
// website Data
// homePage
app.use("/api/dashboardadmin/website/homepage/", createhomePageData_1.default);
app.use("/api/dashboardadmin/website/homepage/", gethomePageData_1.default);
app.use("/api/dashboardadmin/website/homepage/", updatehomePageData_1.default);
// company-info
app.use("/api/dashboardadmin/website/company-info/", createCompanyInfo_1.default);
app.use("/api/dashboardadmin/website/company-info/", getCompanyInfo_1.default);
app.use("/api/dashboardadmin/website/company-info/", updateCompanyInfo_1.default);
// --- banner routes-----------------------------------------
app.use("/api/dashboardadmin/website/banners", createBanners_1.default);
app.use("/api/dashboardadmin/website/banners", getBanners_1.default);
app.use("/api/dashboardadmin/website/banners", updateBanners_1.default);
app.use("/api/dashboardadmin/website/company-info/", createCompanyInfo_1.default);
app.use("/api/dashboardadmin/website/company-info/", getCompanyInfo_1.default);
app.use("/api/dashboardadmin/website/company-info/", updateCompanyInfo_1.default);
// blog
//postcategorie
app.use("/api/dashboardadmin/blog/postcategorie", createPostCategorie_1.default);
app.use("/api/dashboardadmin/blog/postcategorie", getAllPostCategorie_1.default);
app.use("/api/dashboardadmin/blog/postcategorie", deletePostCategorie_1.default);
app.use("/api/dashboardadmin/blog/postcategorie", updatePostCategorie_1.default);
app.use("/api/dashboardadmin/blog/postcategorie", getPostCategorieById_1.default);
//postsubcategorie
app.use("/api/dashboardadmin/blog/postsubcategorie", createPostSubCategorie_1.default);
app.use("/api/dashboardadmin/blog/postsubcategorie", getAllPostSubCategorie_1.default);
app.use("/api/dashboardadmin/blog/postsubcategorie", deletePostSubCategorie_1.default);
app.use("/api/dashboardadmin/blog/postsubcategorie", updatePostSubCategorie_1.default);
app.use("/api/dashboardadmin/blog/postsubcategorie", getPostSubCategorieById_1.default);
app.use("/api/dashboardadmin/blog/postsubcategorie", getPostSubCategroietByParent_1.default);
//post
app.use("/api/dashboardadmin/blog/post", createPost_1.default);
app.use("/api/dashboardadmin/blog/post", deletePost_1.default);
app.use("/api/dashboardadmin/blog/post", getAllPost_1.default);
app.use("/api/dashboardadmin/blog/post", getPostById_1.default);
app.use("/api/dashboardadmin/blog/post", updatePost_1.default);
// Health-check endpoint (optional)
app.get('/api', (req, res) => {
    res.json({ message: 'API is running' });
});
app.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1) Synchronize local permission constants with the DB
        const permissionsChanged = yield (0, createOrUpdatePermissions_1.createOrUpdatePermissions)();
        if (permissionsChanged) {
            // 2) Initialize default roles that reference those permissions
            yield (0, initRoles_1.initializeDefaultRoles)();
            // 3) Create or verify the SuperAdmin user
            yield (0, initSuperAdmin_1.default)();
        }
        else {
            console.log('🔁 Skipped role and SuperAdmin initialization — no permission changes.');
        }
        // 4) Finally, start the server
        app.listen(port, () => {
            console.log(`🚀 Server is running on port ${port}`);
        });
    }
    catch (err) {
        console.error('❌ Error during initialization:', err);
        process.exit(1);
    }
}))();
