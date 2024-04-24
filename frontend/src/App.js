import axios from 'axios';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom"
import AddProduct from './pages/addProduct/AddProduct';
import { useDispatch } from "react-redux";
import { useEffect } from 'react';
import { getLoginStatus } from './services/authService';
import { SET_LOGIN } from './redux/features/auth/authSlice';
import { ToastContainer } from 'react-toastify';
import Dashboard from './pages/dashboard/Dashboard';
import Layout from './components/layout/Layout';
import Sidebar from './components/sidebar/Sidebar';
import 'react-toastify/dist/ReactToastify.css';
import EditProduct from './pages/editProduct/EditProduct';
import Categories from './pages/marketplace/categories/Categories';
import MarketplaceNavbar from './components/marketplaceNav/MarketplaceNavbar';
import { CategoryProvider } from './customHook/CategoryProvider';
import ProductDetailsfarmer from '../src/components/product/productDetails/ProductDetails';
import ProductDetails from './pages/marketplace//details/ProductDetails';
import MarketHome from './pages/marketplace/home/marketHomePage';
import ProductAdminReport from './components/productAdminReport/productAdminReport';
import OfferManagement from "./components/offer/Offers";
import OfferPreview from "./components/offer/OfferPreview";



axios.defaults.withCredentials = true


function App() {
  // demo cookie
  //document.cookie = "authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWY3ZjU1YjQ4ZDE1OTEzYTQzZmVkZGEiLCJpYXQiOjE3MTMxMTU0NjEsImV4cCI6MTcxMzcyMDI2MX0.I9q9kTaKiqiZxwkKfUsv8re0gNbyD7eLiSQvQW0oOJ0; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";
  const dispatch = useDispatch();
  useEffect(() => {
    async function loginStatus() {
      const status = await getLoginStatus()
      dispatch(SET_LOGIN(status))
    }
    loginStatus()
  }
    , [dispatch])

  return (
    <div className="App">
      <CategoryProvider>
        <BrowserRouter>
          <ToastContainer />
          <Routes>

         

            <Route path="/market" element={
              <MarketplaceNavbar showCategories={true}>
                <Categories />
              </MarketplaceNavbar>
            } />

            <Route path="/product/:productId" element={
              <MarketplaceNavbar showCategories={false}>
                <ProductDetails />
              </MarketplaceNavbar>
            } />

            <Route path="/Home" element={
              <MarketplaceNavbar showCategories={false}>
                <MarketHome/>
              </MarketplaceNavbar>
            } />


            <Route path="/dashboard" element={


              <Sidebar>
                <Layout>
                  <Dashboard />

                </Layout>
              </Sidebar>


            } />

            <Route path="/add-product" element={
              <Sidebar>
                <Layout>
                  <AddProduct />
                </Layout>
              </Sidebar>
            } />


            <Route path="/product-detail/:id" element={
              <Sidebar>
                <Layout>
                  <ProductDetailsfarmer />

                </Layout>
              </Sidebar>


            } />

            <Route path="/edit-product/:id" element={
              <Sidebar>
                <Layout>
                  <EditProduct />
                </Layout>
              </Sidebar>
            } />

            <Route path="/generate-report" element={
              <Sidebar>
                <Layout>
                  <ProductAdminReport />
                </Layout>
              </Sidebar>
            } />

<Route path="/offers" element={<OfferManagement />} />
          <Route path="/offers-preview" element={<OfferPreview />} />

          </Routes>
        </BrowserRouter>
      </CategoryProvider>
    </div>
  );
}

export default App;
