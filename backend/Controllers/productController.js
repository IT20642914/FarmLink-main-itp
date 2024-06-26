const Product = require("../Models/productModel")
const Offer = require("../Models/offersModel")
const cloudinary = require("cloudinary").v2
const asyncHnadler = require("express-async-handler")
const {fileSizeFormatter} = require("../Utills/fileupload")
const sendEmail = require("../Utills/sendEmail")
const { User } = require("../models/user")
const generateReport = require("../Utills/generateReport")
fs = require('fs');



const demo = "65f7f55b48d15913a43fedda" // This is a demo user ID. In a real application, you would get the user ID from the request object
// Add Product 

const  createProduct = asyncHnadler(async (req,res) => {

    const {name,sku,category,quantity,price,description} = req.body

    // Validation
    if(!name|| !category || !quantity || !price || !description ){
        res.status(400)
        throw new Error("Please fill in all fields")

    }
    // Handle Image upload
    let fileData = {};
    if(req.file){

      
        // Save Image to cloudinary

        let uploadedFile;
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path,{
                folder:"FarmLink",
                resource_type:"image",
            })
        } catch (error) {
            res.status(500)
            throw new Error("Image could not be uploaded")
        }

      

        fileData = {
            fileName: req.file.originalname, 
            filePath: uploadedFile.secure_url,
            fileType: req.file.mimetype, 
            fileSize: fileSizeFormatter(req.file.size,2) ,
        }

      

    }

    

    //Create prduct
    const product = await Product.create({
        user:demo,
        name,
        sku,
        category,
        quantity,
        price,
        description,
        image: fileData,
    }) 

    res.status(201).json(product)

})

const getAllProduct = asyncHnadler(async (req, res) => {
    const products = await Product.find().sort("-createdAt");

    const productIds = products.map(product => product._id);

    const offers = await Offer.find({ products: { $in: productIds } }).populate('products');
    const formattedOffers = offers.flatMap(offer => offer.products.map(product => ({
            _id: product._id,
            user: product.user,
            name: product.name,
            sku: product.sku,
            category: product.category,
            quantity: product.quantity,
            price: product.price,
            description: product.description,
            image: product.image,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            __v: product.__v,
            offer: {
                _id: offer._id,
                coupon: offer.coupon,
                discount: offer.discount,
                startDate: offer.startDate,
                endDate: offer.endDate
            }
        })));

    const mergedProducts = products.map(product => {
        const offer = formattedOffers.find(offer => offer._id.equals(product._id));
        return {
            ...product.toObject(),
            offer: offer ? {
                _id: offer.offer._id,
                coupon: offer.offer.coupon,
                discount: offer.offer.discount,
                startDate: offer.offer.startDate,
                endDate: offer.offer.endDate
            } : null
        };
    });

    // Send the response with merged products and offers
    res.status(200).json( mergedProducts );
});



const mergeProductsAndOffers = (products, offers) => {
    // Create a map of offers indexed by product ID
    const offerMap = new Map(offers.map(offer => [offer.products._id.toString(), offer]));

    // Iterate over each product and merge the offer if available
    const mergedProducts = products.map(product => {
        const offer = offerMap.get(product._id.toString());
        return { ...product, offer: offer || null };
    });

    return mergedProducts;
};


const getProductByCategory = asyncHnadler(async (req, res) => {
    const category = req.params.category; // Assuming your route parameter is named 'category'
    if (category === 'offers') {
        // If the type is 'offers', find offers related to these products
        const products = await Product.find({}).sort("-createdAt");
        const productIds = products.map(product => product._id);
        const offers = await Offer.find({ products: { $in: productIds } }).populate('products');
        const formattedOffers = offers.flatMap(offer => offer.products.map(product => ({
            _id: product._id,
            user: product.user,
            name: product.name,
            sku: product.sku,
            category: product.category,
            quantity: product.quantity,
            price: product.price,
            description: product.description,
            image: product.image,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            __v: product.__v,
            offer: {
                _id: offer._id,
                coupon: offer.coupon,
                discount: offer.discount,
                startDate: offer.startDate,
                endDate: offer.endDate
            }
        })));
        res.status(200).json(formattedOffers);
    } else {
        const products = await Product.find({ category: category }).sort("-createdAt");
        res.status(200).json(products);
    }
});
// Get All products 

const getProduct = asyncHnadler(async (req,res) => {
    const products = await Product.find({user:/*req.user._id*/demo}).sort("-createdAt")
    res.status(200).json(products)
 })

  // Get single product Marketplace without user
 
  const getSingleProductAll = asyncHnadler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    const offers = await Offer.find({ products: { $in: req.params.id } }).populate('products');

    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    const singleProduct = {
        _id: product._id,
        user: product.user,
        name: product.name,
        sku: product.sku,
        category: product.category,
        quantity: product.quantity,
        price: product.price,
        description: product.description,
        image: product.image,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        __v: product.__v,
        offer: null // Default to null if no offers are found
    };

    if (offers.length > 0) {
        const offerData = offers.flatMap(offer => offer.products.map(product => ({
                    _id: offer._id,
                    coupon: offer.coupon,
                    discount: offer.discount,
                    startDate: offer.startDate,
                    endDate: offer.endDate
                
            })));
         singleProduct.offer = offerData[0] || null;

        }

    res.status(200).json(singleProduct);
});


 const deleteProduct = asyncHnadler(async (req,res) => {
 
     const product = await Product.findById(req.params.id)
     if(!product){
         // if product doesnt exits
         res.status(404)
         throw new Error("Product not found")
     }
     // match product to its user
     if(product.user.toString() !== /*req.user._id*/demo){
         res.status(401)
         throw new Error("User Not authorized")
     }
     await product.deleteOne();
     res.status(200).json({
         message: "Product Deleted"
     });
 
 })
 
 // Update Product
 
 const  updateProduct = asyncHnadler(async (req,res) => {
 
     const {name,category,quantity,price,description} = req.body;
     const {id} = req.params;
 
     const product = await Product.findById(req.params.id)
 
      // if product doesnt exits
     if(!product){
    
         res.status(404)
         throw new Error("Product not found")
 
     }
        // match product to its user
        if(product.user.toString() !== /*req.user._id*/demo){
         res.status(401)
         throw new Error("User Not authorized")
     }
 
 
     // Handle Image upload
     let fileData = {};
 
     if(req.file){
      // Save Image to cloudinary
         let uploadedFile;
         try {
             uploadedFile = await cloudinary.uploader.upload(req.file.path,{
                 folder:"ShyApp1",
                 resource_type:"image",
             })
         } catch (error) {
             res.status(500)
             throw new Error("Image could not be uploaded")
         }
 
 
         fileData = {
             fileName: req.file.originalname, 
             filePath: uploadedFile.secure_url,
             fileType: req.file.mimetype, 
             fileSize: fileSizeFormatter(req.file.size,2) ,
         }
     }
 
 
     //Update product
     const updateProduct = await Product.findByIdAndUpdate(
         {_id: id},
         {
             name,
             category,
             quantity,
             price,
             description,
             image: Object.keys(fileData).length === 0 ? product?.image :fileData ,
         },
         {
             new: true,
             runValidators: true,
         }
     )
 
 
     res.status(200).json(updateProduct)

     // send email if quantity is less than 10
        if(updateProduct.quantity < 10){
            const user = await User.findById(product.user);
            
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    // Send email
    const subject = `Low Stock Alert: ${updateProduct.name}`;
    const message = `The product ${updateProduct.name} is running low in stock. Current stock: ${updateProduct.quantity}`;
    const send_to = user.email;
    const reply_to = user.email;
    await sendEmail(subject, message, send_to, reply_to);

}
 
 })
 // Delete all products (Not used in frontend just to make my life easier)
 const deleteAllProducts = asyncHnadler(async (req, res) => {
    await Product.deleteMany({}); // Delete all documents in the Product collection
    res.status(200).json({ message: "All products deleted successfully" });
});



// Get products by user ID
const getProductsById = asyncHnadler(async (req, res) => {
    
    const userId = req.params.id; 
    const products = await Product.find({ user: userId }).sort("-createdAt");
    
    if (!products) {
        res.status(404);
        throw new Error("Products not found");
    }else{
        res.status(200).json(products);
    
    }
    
    
});

// send email to user

const sendNotificationEmail = async (req, res) => {
    const { subject, message, send_to, reply_to } = req.body;
    
    try {
        // Send email
        await sendEmail(subject, message, send_to, reply_to); 
        res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to send email' });
    }
};

// Generate and download report

const generateAndDownloadReport = asyncHnadler(async (req, res) => {
    try {
        // Await the promise to resolve, getting the actual file path
        const filePath = await generateReport(req.body.title, req.body.content);
        
        // Use the resolved filePath in res.download
        res.download(filePath, 'report.pdf', (err) => { // Added 'report.pdf' as the download filename
            if (err) {
                console.error(err);
                res.status(500).send('Error generating report');
            } else {
                // Optionally delete the file after sending it to the client
                fs.unlink(filePath, deleteError => {
                    if(deleteError) {
                        console.error("Error deleting the file:", deleteError);
                    }
                });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating report');
    }
});



 module.exports = {

     createProduct,
     getProduct, 
     deleteProduct,
     updateProduct,
     getAllProduct,
     getSingleProductAll,
     getProductByCategory,
     deleteAllProducts,
     getProductsById,
     sendNotificationEmail,
     generateAndDownloadReport
    
 }

 