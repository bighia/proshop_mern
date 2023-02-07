import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Form, Button, Image } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import FormContainer from "../components/FormContainer";
import { listProductDetails, updateProduct } from "../actions/productActions";
import { PRODUCT_UPDATE_RESET } from "../constants/productConstants";
// import { useForm } from "react-hook-form";
import TinyMCE from "../components/TinyMCE";

// https://refine.dev/blog/how-to-multipart-file-upload-with-react-hook-form/
// https://viblo.asia/p/react-hook-form-vs-formik-Qbq5QmwR5D8
// https://viblo.asia/p/react-hook-form-xu-ly-form-de-dang-hon-bao-gio-het-RnB5pAdDKPG
// https://codesandbox.io/s/y74yf?file=/src/App.js
// Upload file to firebase with react-hook-form https://www.newline.co/@satansdeer/handling-file-fields-using-react-hook-form--93ebef46
// TODO: Upload image: Open Modal with file-picker, drag-drop file upload, image name/title, width-height, description(alt)

const ProductEditScreen = () => {
    const params = useParams();
    const productId = params.id;
    const navigate = useNavigate();

    // const {
    //     register,
    //     handleSubmit,
    //     reset,
    //     setError,
    //     control,
    //     formState: { errors },
    //     getValues,
    // } = useForm();

    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [image, setImage] = useState("");
    // const [image_base64, setImage_base64] = useState("");
    const [brand, setBrand] = useState("");
    const [category, setCategory] = useState("");
    const [countInStock, setCountInStock] = useState(0);
    const [description, setDescription] = useState("");
    // const [general, setGeneral] = useState("");
    // const [detail, setDetail] = useState("");
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isSuccess, setIsSuccess] = useState("");
    const [maxFileSize, setMaxFileSize] = useState("");
    const [base64MaxFileSize, setBase64MaxFileSize] = useState("");
    const [url, setURL] = useState("");
    const [generalResult, setGeneralResult] = useState("");
    const [detailResult, setDetailResult] = useState("");
    const dispatch = useDispatch();

    const productDetails = useSelector((state) => state.productDetails);
    const { loading, error, product } = productDetails;

    const productUpdate = useSelector((state) => state.productUpdate);
    const {
        loading: loadingUpdate,
        error: errorUpdate,
        success: successUpdate,
    } = productUpdate;

    const userLogin = useSelector((state) => state.userLogin);
    const { userInfo } = userLogin;

    const generalRef = useRef(null);
    const detailRef = useRef(null);

    useEffect(() => {
        if (successUpdate) {
            dispatch({ type: PRODUCT_UPDATE_RESET });
            navigate("/admin/productlist");
        } else {
            // IIFE
            (async () => {
                const { data } = await axios.get("/api/config");
                setURL(data.url);
                setMaxFileSize(data.maxFileSize);
                setBase64MaxFileSize(data.base64MaxFileSize);
            })();

            console.log("Product Detail: " + product.detail);

            if (!product.name || product._id !== productId) {
                dispatch(listProductDetails(productId));
            } else {
                setName(product.name);
                setPrice(product.price);
                product.image && setImage(product.image);
                // product.image_base64 && setImage_base64(product.image_base64);
                setBrand(product.brand);
                setCategory(product.category);
                setCountInStock(product.countInStock);
                setDescription(product.description);
                product.general && setGeneralResult(product.general);
                product.detail && setDetailResult(product.detail);
            }
        }
    }, [dispatch, navigate, productId, product, successUpdate, userInfo]);

    const setEditorContent = (e) => {
        e.preventDefault();
        if (generalRef.current) {
            console.log("GENERAL: " + generalRef.current.getContent());
            setGeneralResult(generalRef.current.getContent());
        }
        if (detailRef.current) {
            console.log("DETAIL: " + detailRef.current.getContent());
            setDetailResult(detailRef.current.getContent());
        }
    };

    const setGeneralContent = (e) => {
        e.preventDefault();
        if (generalRef.current) {
            console.log("GENERAL: " + generalRef.current.getContent());
            setGeneralResult(generalRef.current.getContent());
        }
    };
    const setDetailContent = (e) => {
        e.preventDefault();
        if (detailRef.current) {
            console.log("DETAIL: " + detailRef.current.getContent());
            setDetailResult(detailRef.current.getContent());
        }
    };

    const file_picker_callback = (callback, value, meta) => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");

        input.addEventListener("change", (e) => {
            const file = e.target.files[0];

            const reader = new FileReader();
            reader.addEventListener("load", () => {
                /*
                  Note: Now we need to register the blob in TinyMCEs image blob
                  registry. In the next release this part hopefully won't be
                  necessary, as we are looking to handle it internally.
                */
                const id = "blobid" + new Date().getTime();
                const blobCache =
                    window.tinymce.activeEditor.editorUpload.blobCache;
                const base64 = reader.result.split(",")[1];
                const blobInfo = blobCache.create(id, file, base64);
                blobCache.add(blobInfo);

                /* call the callback and populate the Title field with the file name */
                callback(blobInfo.blobUri(), { title: file.name });
            });
            reader.readAsDataURL(file);
        });

        input.click();

        // Provide file and text for the link dialog
        // if (meta.filetype === "file") {
        //     callback("mypage.html", { text: "My text" });
        // }

        // Provide image and alt text for the image dialog
        // if (meta.filetype === "image") {
        //     callback("myimage.jpg", { alt: "My alt text" });
        // }

        // Provide alternative source and posted for the media dialog
        // if (meta.filetype === "media") {
        //     callback("movie.mp4", {
        //         source2: "alt.ogg",
        //         poster: "image.jpg",
        //     });
        // }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.readAsDataURL(file);

            reader.onload = () => {
                console.log("called: ", reader);
                console.log("reader.result: ", reader.result);
                console.log("Type of reader.result: ", typeof reader.result);
                resolve(reader.result);
            };
            reader.onerror = (error) => {
                reject(error);
            };
        });
    };

    // const getMaxFileSize = async () => {
    //     const { data } = await axios.get("/api/config");
    //     setMaxFileSize(data.maxFileSize);
    //     setBase64MaxFileSize(data.base64MaxFileSize);
    // };

    // console.log(getMaxFileSize());

    // const selectedFileHandler = (event) => {
    //     if (event.target.files.length > 0) {
    //         setSelectedFile(event.target.files[0]);
    //     }
    // };

    const validateFileSize = async (event) => {
        const minSize = 0; // 1MB
        const base64MaxSize = 1024 * 1024 * base64MaxFileSize; // 5MB
        const maxSize = 1024 * 1024 * maxFileSize; // 10MB
        console.log(
            "MaxSize 10MB: " +
                maxSize +
                " = " +
                1024 +
                " * " +
                1024 +
                " * " +
                maxFileSize
        );
        console.log(
            "Base64MaxSize 5MB: " +
                base64MaxSize +
                " = " +
                1024 +
                " * " +
                1024 +
                " * " +
                base64MaxFileSize
        );

        let file;
        if (event.target.files.length > 0) {
            file = event.target.files[0];
            setSelectedFile(event.target.files[0]);
        } else {
            setErrorMsg("Please choose a file");
            setIsSuccess("fail");
            return false;
        }

        console.log("FILE SIZE: " + file.size);
        // const fileSizeInBytes = file.size / (1024 * 1024);
        const fileSizeInBytes = file.size;

        if (fileSizeInBytes <= minSize) {
            setErrorMsg("File size is less than minimum limit");
            setIsSuccess("fail");
            return false;
        }
        if (fileSizeInBytes > maxSize) {
            setErrorMsg("File size is greater than maximum limit");
            setIsSuccess("fail");
            return false;
        }

        if (fileSizeInBytes <= base64MaxSize) {
            const base64 = await convertToBase64(file);
            console.log("UPLOAD FILE: " + file);
            console.log("BASE64: " + JSON.stringify(base64));
            // await setImage_base64(base64);
            await setImage(base64);
            setIsSuccess("base64");
            console.log("BASE64IMG: " + image);
        }

        setErrorMsg("");
        setIsSuccess("pass");
    };

    const uploadFileHandler = async () => {
        // const file = await e.target.files[0];
        // const base64 = convertToBase64(selectedFile);
        // console.log("UPLOAD FILE: " + selectedFile);
        // console.log("BASE64: " + base64);
        // console.log("BASE64IMG: " + image_base64);
        // setImage_base64("");
        const formData = new FormData();
        formData.append("image", selectedFile);
        // console.log("FILE: " + file);
        console.log("FILE Selected: " + selectedFile);

        setUploading(true);

        try {
            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            };

            // console.log("FORM DATA: " + formData);
            const { data } = await axios.post("/api/upload", formData, config);

            // console.log("UPLOAD DATA: " + JSON.stringify(data));
            setImage(data);
            setUploading(false);
        } catch (error) {
            console.error(error);
            setUploading(false);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        console.log("IS SUCCESS: " + isSuccess);
        console.log("GENERAL RESULT: " + generalResult);
        // isSuccess === "pass" && (await uploadFileHandler());
        dispatch(
            updateProduct({
                _id: productId,
                name,
                price,
                brand,
                category,
                countInStock,
                description,
                general: generalResult,
                detail: detailResult,
                image,
                // image_base64,
            })
        );
    };

    // const onError = (error) => {
    //     console.log("ERROR:::", error);
    // };

    return (
        <>
            <Link
                to={
                    userInfo && userInfo.isAdmin
                        ? "/admin/productlist"
                        : // : userInfo.isEditor
                          // ? "/editor/productlist"
                          "/"
                }
                className="btn btn-light my-3"
            >
                Go Back
            </Link>
            <FormContainer>
                <h1>Edit Product</h1>
                {loadingUpdate && <Loader />}
                {errorUpdate && (
                    <Message variant="danger">{errorUpdate}</Message>
                )}
                {loading ? (
                    <Loader />
                ) : error ? (
                    <Message variant="danger">{error}</Message>
                ) : (
                    <Form
                        onSubmit={
                            isSuccess === "pass"
                                ? uploadFileHandler &&
                                  //   handleSubmit(submitHandler, onError)
                                  // : handleSubmit(submitHandler, onError)
                                  submitHandler
                                : submitHandler
                        }
                        // onReset={reset}
                    >
                        <Form.Group controlId="name">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="name"
                                placeholder="Enter name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            ></Form.Control>
                        </Form.Group>

                        <Form.Group controlId="price">
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Enter price"
                                value={price}
                                onChange={(e) =>
                                    setPrice(Number(e.target.value))
                                }
                            />
                        </Form.Group>

                        <Form.Group controlId="image">
                            <Form.Label>Image</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter image url"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                            />
                            <Form.Control
                                as={"input"}
                                type="file"
                                multiple={false}
                                label="Choose File"
                                // onChange={selectedFileHandler}
                                onChange={validateFileSize}
                                //{...register("productImage", {
                                //    required: "Please select product image",
                                //})}
                            />
                            {/*{errors.productImage && (*/}
                            {/*    <Message variant={"danger"}>*/}
                            {/*        {errors.productImage.message}*/}
                            {/*    </Message>*/}
                            {/*)}*/}
                            {uploading && <Loader />}
                            {isSuccess !== "fail" && (
                                <Message variant={"success"}>
                                    Validation successfully
                                </Message>
                            )}
                            {errorMsg && (
                                <Message variant={"danger"}>{errorMsg}</Message>
                            )}
                            <Button
                                className={"btn btn-sm"}
                                onClick={uploadFileHandler}
                                variant={"primary"}
                            >
                                Upload
                            </Button>
                            {image && isSuccess !== "fail" && (
                                <div>
                                    <Form.Label>Image Preview</Form.Label>
                                    <Image
                                        src={image}
                                        height={"200px"}
                                        alt={"Base64 image"}
                                    />
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group controlId="brand">
                            <Form.Label>Brand</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter brand"
                                required={true}
                                isInvalid={true}
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                            ></Form.Control>
                            <Form.Control.Feedback type={"invalid"}>
                                Please input Product Brand
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="countInStock">
                            <Form.Label>Count In Stock</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Enter countInStock"
                                value={countInStock}
                                onChange={(e) =>
                                    setCountInStock(Number(e.target.value))
                                }
                            ></Form.Control>
                        </Form.Group>

                        <Form.Group controlId="category">
                            <Form.Label>Category</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            ></Form.Control>
                        </Form.Group>

                        <Form.Group controlId="description">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></Form.Control>
                        </Form.Group>

                        <div>
                            {/*TinyMCE*/}
                            <Form.Group
                                controlId="product-general"
                                className={"my-3"}
                            >
                                <Form.Label>Product General</Form.Label>
                                <TinyMCE
                                    url={url}
                                    editorRef={generalRef}
                                    content={product.general && product.general}
                                    log={setEditorContent}
                                    file_picker_callback={file_picker_callback}
                                />
                            </Form.Group>
                        </div>

                        <div>
                            {/*TinyMCE*/}
                            <Form.Group
                                controlId="product-detail"
                                className={"my-3"}
                            >
                                <Form.Label>Product Detail</Form.Label>
                                <TinyMCE
                                    url={url}
                                    editorRef={detailRef}
                                    content={product.detail && product.detail}
                                    file_picker_callback={file_picker_callback}
                                    log={setEditorContent}
                                />
                            </Form.Group>
                        </div>

                        <Button type="submit" variant="primary">
                            Update
                        </Button>
                    </Form>
                )}
            </FormContainer>
        </>
    );
};

export default ProductEditScreen;
