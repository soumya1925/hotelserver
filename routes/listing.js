const router = require("express").Router()
const multer = require("multer");
// const User = require("../models/User")

const Listing = require("../models/Listing");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage })


//create listing api

router.post("/create", upload.array("listingPhotos"), async (req, res) => {
    try {
        const { creator, category, type, streetAddress, aptSuite,
            city, province, country, guestCount, bedroomCount, bedCount, bathroomCount, amenities, title, description, highlight, highlightDesc, price } = req.body;


        const listingPhotos = req.files
        if (!listingPhotos) {
            return res.status(400).send("No file uploaded.")
        }
        const listingPhotoPaths = listingPhotos.map((file) => file.path);

        const newListing = new Listing(
            {
                creator,
                category, type, streetAddress, aptSuite,
                city, province, country, guestCount, bedroomCount, bedCount, bathroomCount, amenities,listingPhotoPaths ,title, description, highlight, highlightDesc, price
            }
        )
        await newListing.save();
        res.status(200).json(newListing)

    }
    catch (err) {
        res.status(400).json({message:"Failed to create Listing",error:err.message});
        console.log(err)
     }
});
// get listings

router.get("/", async(req,res)=>{
    const qCategory = req.query.category
    try{

        let listings
        if(qCategory){
            listings =await Listing.find({
                category:qCategory
            }).populate("creator");
        }
        else{
            listings=await Listing.find().populate("creator");
        }
        res.status(200).json(listings);
    }
    catch(err){
        res.status(409).json({message:"Failed to fetch listing",error:err.message});
        console.log(err);
    }
})
/* GET LISTINGS BY SEARCH */
router.get("/search/:search", async (req, res) => {
    const { search } = req.params
  
    try {
      let listings = []
  
      if (search === "all") {
        listings = await Listing.find().populate("creator")
      } else {
        listings = await Listing.find({
          $or: [
            { category: {$regex: search, $options: "i" } },
            { title: {$regex: search, $options: "i" } },
          ]
        }).populate("creator")
      }
  
      res.status(200).json(listings)
    } catch (err) {
      res.status(404).json({ message: "Fail to fetch listings", error: err.message })
      console.log(err)
    }
  })

/* Listing Details */

router.get("/:listingId", async(req, res)=>{
    try{
       const {listingId} = req.params
       const listing = await Listing.findById(listingId)
      .populate("creator", "firstName lastName profileImagePath");
       res.status(202).json(listing)
    }
    catch(err){
        res.status(404).json({message:"Listing can not be found",err})

    }
})
module.exports =router;