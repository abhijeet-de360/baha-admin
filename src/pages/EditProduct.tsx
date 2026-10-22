import React from "react";
import { useParams } from "react-router-dom";

const EditProduct = () => {
  const params = useParams();
  const productId = params.id as string;
  console.log(productId);
  return <div>EditProduct</div>;
};

export default EditProduct;
