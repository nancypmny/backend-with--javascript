
import asyncHandler from "../utils/AsyncHandler.js";
import { Apierror } from "../utils/Apierror.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/FileHandler.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.createAccessToken()
        const refreshToken = user.createRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})

        return {refreshToken,accessToken}


    } catch (error) {
        throw new Apierror(500,"Something went wrong")
    }
}

const registerUser = asyncHandler( async(req,res) => {
    //get user details from frontend
    //validation - not empty
    //check if user already exists : username , email
    //check for images,check for avatar
    //upload them to cloudinary,avatar
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation 
    //retur response

    const {username,fullname,email,password} = req.body

    if(
        [username,fullname,email,password].some((field) => 
            field?.trim() === ""
        )
    ){
        throw new Apierror(400,"All fields are required");
    }

    const existedUser=await User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        throw new Apierror(409,"User with email or username already exists")
    }

    const avatarfile = req.files?.avatar[0]?.path;
    //const coverImageLocal = req.files?.coverImage[0]?.path;
    
    let coverImageLocalpath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalpath = req.files.coverImage[0].path
    }

    if(!avatarfile) throw new Apierror(400,"Avatar file is required");

    const avatar = await uploadOnCloudinary(avatarfile);
    const coverImage = await uploadOnCloudinary(coverImageLocalpath);

    if(!avatar) throw new Apierror(400,"Avatar file is required");

    const user= await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) throw new Apierror(500,"Something wrong !!");

    return res.status(201).json(
        new Apiresponse(200,createdUser, "user registed successfully")
    )
    
})

const login = asyncHandler( async(req,res) => {
    //get data from user
    //username and email
    //user present or not
    //password
    //create access and refresh token
    //send cookies
    //return res

    const {username,email,password} = req.body

    if(!username && !email){
        throw new Apierror(400,"username and email is required");

    }

    const user=await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new Apierror(404,"user does not present");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new Apierror(401,"invalid user password");
    }

    const{accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await user.findById(user._id).select("-password -refreshToken")

    const option={
        httpOnly:true,
        secure:true
    }

    return res.status(201)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
        new Apiresponse(
            200,
            {
                user:loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )

    )


})

export {registerUser}