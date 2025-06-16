import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createOrUpdatePermissions } from './scripts/createOrUpdatePermissions';
import { initializeDefaultRoles } from './scripts/initRoles';
import createSuperAdminAccount from './scripts/initSuperAdmin';

// Load environment variables
dotenv.config();

// Connect to the database (this runs db.ts)
import './db';

// Initialize app
const app = express();

// 1) Use all required middleware *before* routes
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: ['http://localhost:3001', 'http://localhost:3002'], 
    credentials: true,
  })
);

const port = process.env.PORT || 3000;

// -----------------Frontend Import ---------------------- //

//Import route modules auth Client
import signinClient from './routes/client/auth/signin'
import authRoutes from './routes/client/auth/auth'
import signupClient from './routes/client/auth/signup'
import updateAuth from './routes/client/settings/updateClientdetails';

// Import route Reviews
import PostProductReviews from './routes/products/PostProductReviews';

import SimilarProduct from './routes/products/SimilarProduct'

// Import route modules
import productRoutes from './routes/homePage/productsRoutes';
import categorieRoutes from './routes/NavMenu/categoriesRoutes';
import brandsRoutes from './routes/homePage/brandsRoutes';

import storesRoutes from './routes/homePage/storesRoutes';
import contactUsRoutes from './routes/NavMenu/contactUsRoutes';
import HomeBanner from './routes/homePage/HomeBanner';
import categorieSubCategoriePage from './routes/NavMenu/categorieSubCategoriePage'
import ProductPromotion from './routes/NavMenu/ProductPromotion'
import ProductCollection from './routes/NavMenu/ProductCollection'
import BestProductCollection from './routes/NavMenu/BestProductCollection'

import MainProductSection from './routes/products/MainProductSection';
import ProductDetails from './routes/products/ProductDetails';
import ProductReviews from './routes/products/ProductReviews';


//Import route Blog Model
import postsRoutes from './routes/blog/postsRoutes'
import PostCardData from './routes/blog/PostCardData'
import PostCardDataByCategorie from './routes/blog/PostCardDataByCategorie'

//Import route Client
import getOrderByRef from './routes/client/order/getOrderByRef'
import postOrderClient from './routes/client/order/postOrderClient'
import getOrdersByClient from './routes/client/order/getOrdersByClient'

import getClientAddress from './routes/client/address/getAddress'
import postClientAddress from './routes/client/address/PostAddress'
import updateClienAddressById from './routes/client/address/updateAddressById'
import deleteClientAddress from './routes/client/address/deleteAddress'

//---------------Frontendadmin Import--------------------//

import signinDashboardAdmin from "./routes/dashboardadmin/users/dashboardSignin"
import createdUser from "./routes/dashboardadmin/users/createUser"
import deleteUser from "./routes/dashboardadmin/users/deleteUser";
import dashboardAuth from "./routes/dashboardadmin/users/dashboardAuth"

import getAllUsersWithRole from "./routes/dashboardadmin/users/getAllUsersWithRole"

import createRoles from "./routes/dashboardadmin/roles/createRoles"
import getAllRoles from "./routes/dashboardadmin/roles/getAllRoles"
import updateUserRole from "./routes/dashboardadmin/roles/updateUserRole"
import DeleteRole from "./routes/dashboardadmin/roles/deleteRoles"

import getAllPermission from "./routes/dashboardadmin/roles/getAllPermission"

import updateRolePermissions from "./routes/dashboardadmin/roles/updateRolePermissions"

import getAllClient from "./routes/dashboardadmin/client/getAllClient"
import deleteClient from "./routes/dashboardadmin/client/deleteClient"


import getAllOrders from './routes/dashboardadmin/orders/getAllOrders';


// website Data

// homepage routes
import createHomePageData from "./routes/dashboardadmin/website/homepage/createhomePageData";
import getHomePageData    from "./routes/dashboardadmin/website/homepage/gethomePageData";
import updateHomePageData from "./routes/dashboardadmin/website/homepage/updatehomePageData";

// company-info routes
import createCompanyInfo  from "./routes/dashboardadmin/website/company-info/createCompanyInfo";
import getCompanyInfo     from "./routes/dashboardadmin/website/company-info/getCompanyInfo";
import updateCompanyInfo  from "./routes/dashboardadmin/website/company-info/updateCompanyInfo";

// --- banner routes-----------------------------------------
import createBanners      from "./routes/dashboardadmin/website/banners/createBanners";
import getBanners         from "./routes/dashboardadmin/website/banners/getBanners";
import updateBanners      from "./routes/dashboardadmin/website/banners/updateBanners";


// stock
//product

import addNewProduct from "./routes/dashboardadmin/stock/allproducts/addNewProduct"
import deleteProduct from "./routes/dashboardadmin/stock/allproducts/deleteProduct"
import getAllProducts from "./routes/dashboardadmin/stock/allproducts/getAllProducts"
import updateProduct from "./routes/dashboardadmin/stock/allproducts/updateProduct"
import getProductById from "./routes/dashboardadmin/stock/allproducts/getProductById"

// ProductAttribute
import addNewProductAttribute from "./routes/dashboardadmin/stock/productattribute/addNewProductAttribute"
import deleteProductAttribute from "./routes/dashboardadmin/stock/productattribute/deleteProductAttribute"
import getAllProductAttribute from "./routes/dashboardadmin/stock/productattribute/getAllProductAttribute"
import getProductAttributeById from "./routes/dashboardadmin/stock/productattribute/getProductAttributeById"
import updateProductAttribute from "./routes/dashboardadmin/stock/productattribute/updateProductAttribute"


// brands
//--------------------------------------------------
import addNewBrand   from "./routes/dashboardadmin/stock/brands/addNewBrand";
import deleteBrand   from "./routes/dashboardadmin/stock/brands/deleteBrand";
import getAllBrands  from "./routes/dashboardadmin/stock/brands/getAllBrands";
import updateBrand   from "./routes/dashboardadmin/stock/brands/updateBrand";
import getBrandById from "./routes/dashboardadmin/stock/brands/getBrandById";

// categories
//--------------------------------------------------
import addNewCategorie   from "./routes/dashboardadmin/stock/categories/addNewCategorie";
import deleteCategorie   from "./routes/dashboardadmin/stock/categories/deleteCategorie";
import getAllCategories  from "./routes/dashboardadmin/stock/categories/getAllCategories";
import updateCategorie   from "./routes/dashboardadmin/stock/categories/updateCategorie";

import getCategorieById from "./routes/dashboardadmin/stock/categories/getCategorieById";

// sub-categories
//--------------------------------------------------
import addNewSubCategorie  from "./routes/dashboardadmin/stock/subcategories/addNewSubCategorie";
import deleteSubCategorie  from "./routes/dashboardadmin/stock/subcategories/deleteSubCategorie";
import getAllSubCategories from "./routes/dashboardadmin/stock/subcategories/getAllSubCategories";
import updateSubCategorie  from "./routes/dashboardadmin/stock/subcategories/updateSubCategorie";
import getSubCategorieById  from "./routes/dashboardadmin/stock/subcategories/getSubCategorieById";

// boutiques
//--------------------------------------------------
import addNewBoutique   from "./routes/dashboardadmin/stock/boutiques/addNewBoutique";
import deleteBoutique   from "./routes/dashboardadmin/stock/boutiques/deleteBoutique";
import getAllBoutiques  from "./routes/dashboardadmin/stock/boutiques/getAllBoutiques";
import updateBoutique   from "./routes/dashboardadmin/stock/boutiques/updateBoutique";
import getBoutiqueById from "./routes/dashboardadmin/stock/boutiques/getBoutiqueById";


// blog
//-------------------PostCategorie-------------------------------

import createPostCategorie   from "./routes/dashboardadmin/blog/postcategorie/createPostCategorie";
import deletePostCategorie from "./routes/dashboardadmin/blog/postcategorie/deletePostCategorie";
import getAllPostCategorie   from "./routes/dashboardadmin/blog/postcategorie/getAllPostCategorie";
import updatePostCategorie   from "./routes/dashboardadmin/blog/postcategorie/updatePostCategorie";
import getPostCategorieById from "./routes/dashboardadmin/blog/postcategorie/getPostCategorieById";

//-----------------------PostSubCategorie---------------------------


import createPostSubCategorie  from "./routes/dashboardadmin/blog/postsubcategorie/createPostSubCategorie";
import deletePostSubCategorie from "./routes/dashboardadmin/blog/postsubcategorie/deletePostSubCategorie";
import getAllPostSubCategorie   from "./routes/dashboardadmin/blog/postsubcategorie/getAllPostSubCategorie";
import updatePostSubCategorie   from "./routes/dashboardadmin/blog/postsubcategorie/updatePostSubCategorie";
import getPostSubCategorieById from "./routes/dashboardadmin/blog/postsubcategorie/getPostSubCategorieById";

import getPostSubCategroietByParent from "./routes/dashboardadmin/blog/postsubcategorie/getPostSubCategroietByParent";



//-----------------------Post---------------------------

import createPost from "./routes/dashboardadmin/blog/post/createPost";
import getAllPost from "./routes/dashboardadmin/blog/post/getAllPost";
import updatePost from "./routes/dashboardadmin/blog/post/updatePost";
import getPostById from "./routes/dashboardadmin/blog/post/getPostById";
import deletePost from "./routes/dashboardadmin/blog/post/deletePost";

// -----------------Frontend ------------------------ //

// Client Auth
app.use('/api/signin', signinClient);
app.use('/api/auth', authRoutes);
app.use('/api/signup', signupClient);
app.use('/api/clientSetting/', updateAuth);

// Reviews
app.use('/api/reviews', PostProductReviews);

// Client home
app.use('/api/products', productRoutes);
app.use('/api/categories', categorieRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/store', storesRoutes);
app.use('/api/HomePageBanner',HomeBanner);

app.use('/api/products/SimilarProduct',SimilarProduct);
app.use('/api/products/MainProductSection', MainProductSection);
app.use('/api/products/ProductDetails', ProductDetails);
app.use('/api/products/ProductReviews', ProductReviews);
// NavMenu
app.use('/api/NavMenu/categorieSubCategoriePage',categorieSubCategoriePage);
app.use('/api/NavMenu/contactus', contactUsRoutes);
app.use('/api/NavMenu/ProductPromotion',ProductPromotion);
app.use('/api/NavMenu/ProductCollection',ProductCollection);
app.use('/api/NavMenu/BestProductCollection',BestProductCollection);


// Blog
app.use('/api/Blog',postsRoutes);
app.use('/api/Blog',PostCardData);
app.use('/api/Blog',PostCardDataByCategorie);


// Client
app.use('/api/client/order',getOrderByRef);
app.use('/api/client/order',postOrderClient);
app.use('/api/client/order',getOrdersByClient);
app.use('/api/client/address',getClientAddress);
app.use('/api/client/address',postClientAddress);
app.use('/api/client/address',updateClienAddressById);
app.use('/api/client/address',deleteClientAddress);

// -----------------Frontendadmin ------------------------ //

// DashboardUser Auth
app.use('/api/signindashboardadmin', signinDashboardAdmin);
app.use('/api/dashboardAuth', dashboardAuth);

app.use("/api/dashboardadmin/users", deleteUser);
app.use('/api/dashboardadmin/users', createdUser);
app.use('/api/dashboardadmin/getAllPermission', getAllPermission);
app.use('/api/dashboardadmin/getAllUsersWithRole', getAllUsersWithRole);
app.use('/api/dashboardadmin/roles', createRoles);
app.use("/api/dashboardadmin/roles", getAllRoles);
app.use("/api/dashboardadmin/roles", updateUserRole);
app.use("/api/dashboardadmin/roles", DeleteRole);
app.use("/api/dashboardadmin/roles", updateRolePermissions);


// client
app.use("/api/dashboardadmin/client", getAllClient);
app.use("/api/dashboardadmin/client", deleteClient);



// orders

app.use('/api/dashboardadmin/orders', getAllOrders);


// stock
// product
app.use('/api/dashboardadmin/stock/products', addNewProduct);
app.use('/api/dashboardadmin/stock/products', deleteProduct);
app.use('/api/dashboardadmin/stock/products', getAllProducts);
app.use('/api/dashboardadmin/stock/products', updateProduct);
app.use('/api/dashboardadmin/stock/products', getProductById);

app.use('/api/dashboardadmin/stock/productattribute', addNewProductAttribute);
app.use('/api/dashboardadmin/stock/productattribute', getAllProductAttribute);
app.use('/api/dashboardadmin/stock/productattribute', deleteProductAttribute);
app.use('/api/dashboardadmin/stock/productattribute', getProductAttributeById);
app.use('/api/dashboardadmin/stock/productattribute', updateProductAttribute);


// brands

app.use("/api/dashboardadmin/stock/brands", addNewBrand);
app.use("/api/dashboardadmin/stock/brands", deleteBrand);
app.use("/api/dashboardadmin/stock/brands", getAllBrands);
app.use("/api/dashboardadmin/stock/brands", updateBrand);
app.use("/api/dashboardadmin/stock/brands", getBrandById);

// categories

app.use("/api/dashboardadmin/stock/categories", addNewCategorie);
app.use("/api/dashboardadmin/stock/categories", deleteCategorie);
app.use("/api/dashboardadmin/stock/categories", getAllCategories);
app.use("/api/dashboardadmin/stock/categories", updateCategorie);
app.use("/api/dashboardadmin/stock/categories", getCategorieById);

// sub-categories

app.use("/api/dashboardadmin/stock/subcategories", addNewSubCategorie);
app.use("/api/dashboardadmin/stock/subcategories", deleteSubCategorie);
app.use("/api/dashboardadmin/stock/subcategories", getAllSubCategories);
app.use("/api/dashboardadmin/stock/subcategories", updateSubCategorie);
app.use("/api/dashboardadmin/stock/subcategories", getSubCategorieById);


// boutiques

app.use("/api/dashboardadmin/stock/boutiques", addNewBoutique);
app.use("/api/dashboardadmin/stock/boutiques", deleteBoutique);
app.use("/api/dashboardadmin/stock/boutiques", getAllBoutiques);
app.use("/api/dashboardadmin/stock/boutiques", updateBoutique);
app.use("/api/dashboardadmin/stock/boutiques", getBoutiqueById);


// website Data
// homePage
app.use("/api/dashboardadmin/website/homepage/", createHomePageData);
app.use("/api/dashboardadmin/website/homepage/", getHomePageData);
app.use("/api/dashboardadmin/website/homepage/", updateHomePageData);

// company-info

app.use("/api/dashboardadmin/website/company-info/", createCompanyInfo);
app.use("/api/dashboardadmin/website/company-info/", getCompanyInfo);
app.use("/api/dashboardadmin/website/company-info/", updateCompanyInfo);

// --- banner routes-----------------------------------------

app.use("/api/dashboardadmin/website/banners",      createBanners);
app.use("/api/dashboardadmin/website/banners",      getBanners);
app.use("/api/dashboardadmin/website/banners",      updateBanners);


app.use(
  "/api/dashboardadmin/website/company-info/",
  createCompanyInfo
);
app.use(
  "/api/dashboardadmin/website/company-info/",
  getCompanyInfo
);
app.use(
  "/api/dashboardadmin/website/company-info/",
  updateCompanyInfo
);


// blog
//postcategorie
app.use("/api/dashboardadmin/blog/postcategorie", createPostCategorie);
app.use("/api/dashboardadmin/blog/postcategorie", getAllPostCategorie);
app.use("/api/dashboardadmin/blog/postcategorie", deletePostCategorie);
app.use("/api/dashboardadmin/blog/postcategorie", updatePostCategorie);
app.use("/api/dashboardadmin/blog/postcategorie", getPostCategorieById);

//postsubcategorie
app.use("/api/dashboardadmin/blog/postsubcategorie", createPostSubCategorie);
app.use("/api/dashboardadmin/blog/postsubcategorie", getAllPostSubCategorie);
app.use("/api/dashboardadmin/blog/postsubcategorie", deletePostSubCategorie);
app.use("/api/dashboardadmin/blog/postsubcategorie", updatePostSubCategorie);
app.use("/api/dashboardadmin/blog/postsubcategorie", getPostSubCategorieById);
app.use("/api/dashboardadmin/blog/postsubcategorie", getPostSubCategroietByParent);

//post
app.use("/api/dashboardadmin/blog/post", createPost);
app.use("/api/dashboardadmin/blog/post", deletePost);
app.use("/api/dashboardadmin/blog/post", getAllPost);
app.use("/api/dashboardadmin/blog/post", getPostById);
app.use("/api/dashboardadmin/blog/post", updatePost);


// Health-check endpoint (optional)
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'API is running' });
});

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Server is running' });
});

(async () => {
  try {
    // 1) Synchronize local permission constants with the DB
    const permissionsChanged = await createOrUpdatePermissions();

    if (permissionsChanged) {
      // 2) Initialize default roles that reference those permissions
      await initializeDefaultRoles();

      // 3) Create or verify the SuperAdmin user
      await createSuperAdminAccount();
    } else {
      console.log('🔁 Skipped role and SuperAdmin initialization — no permission changes.');
    }

    // 4) Finally, start the server
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('❌ Error during initialization:', err);
    process.exit(1);
  }
})();