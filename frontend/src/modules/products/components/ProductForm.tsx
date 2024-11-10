import React, { useState } from "react";
import {
  Package,
  DollarSign,
  ClipboardList,
  LayoutGrid,
  ImagePlus,
  ChartNoAxesCombined,
  Archive,
} from "lucide-react";
import { ModalRef } from "./modal";
import { Product } from "../types/product";
import axiosInstance from "../../shared/services/axiosInstance";

interface ProductFormProps {
  onSubmit?: (productData: ProductFormDataSubmit) => void;
  onUpdate?: (productData: Product) => void;
  addModalRef: React.RefObject<ModalRef>;
  initialData?: ProductFormData;
  selectedProduct?: Product;
}

export interface ProductFormDataSubmit {
  name: string;
  description: string;
  price: number;
  available_quantity: number;
  attachments: string[];
}
export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  available_quantity: number;
  attachments: File[];
}

const InputWrapper: React.FC<{
  children: React.ReactNode;
  icon: React.ReactNode;
  label: string;
}> = ({ children, icon, label }) => (
  <div className="mb-6">
    <label className="mb-2 flex items-center gap-2 font-sub_headings text-accent-dark-blue">
      {icon}
      {label}
    </label>
    {children}
  </div>
);

const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  onUpdate,
  selectedProduct,
  addModalRef,
  initialData,
}) => {
  const [formData, setFormData] = useState<ProductFormData>(
    initialData || {
      name: "",
      description: "",
      price: 0,
      available_quantity: 0,
      attachments: [],
    },
  );

  const [previews, setPreviews] = useState<string[]>([]); // For image previews
  const [selectedProductData, setSelectedProductData] = useState<
    Product | undefined
  >(selectedProduct);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    const parsedValue =
      (name === "price" || name === "available_quantity") && value !== ""
        ? Number(value)
        : value;

    setFormData({
      ...formData,
      [name]: parsedValue,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setFormData({
        ...formData,
        attachments: fileArray,
      });

      // Generate preview URLs
      const previewUrls = fileArray.map((file) => URL.createObjectURL(file));
      setPreviews(previewUrls);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.preventDefault();
    const ids = [];
    for (let i = 0; i < formData.attachments.length; i++) {
      const fileData = new FormData();
      fileData.append("file", formData.attachments[i]);
      console.log(fileData);
      console.log(formData.attachments[i]);
      const response = await axiosInstance.post(`/attachments`, fileData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      ids.push(response.data._id);
    }
    if (onSubmit) {
      console.log(formData);
      const updatedFormData: ProductFormDataSubmit = {
        ...formData,
        attachments: ids,
      };
      onSubmit(updatedFormData);
    }
    if (onUpdate && selectedProduct) {
      const updatedProduct: Product = {
        ...selectedProduct,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        available_quantity: formData.available_quantity,
        attachments: ids,
      };
      onUpdate(updatedProduct);
    }
    addModalRef.current?.close();
  };

  return (
    <div className="mx-auto max-w-2xl rounded-xl bg-secondary-white">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-headline text-accent-dark-blue">
        <Package className="text-primary-blue" />
        {initialData?.name ? "Update Product" : "Add New Product"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-6">
          {onUpdate && (
            <InputWrapper
              icon={<ChartNoAxesCombined size={20} />}
              label="Total Sales"
            >
              <input
                type="number"
                name="sales"
                value={selectedProduct?.sales}
                disabled
                className="w-full rounded-lg border border-borders-primary bg-secondary-light_grey px-4 py-3 outline-none transition-all focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
              />
            </InputWrapper>
          )}

          <InputWrapper icon={<Package size={20} />} label="Product Name">
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              className="w-full rounded-lg border border-borders-primary bg-secondary-light_grey px-4 py-3 outline-none transition-all focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
            />
          </InputWrapper>

          <InputWrapper icon={<ClipboardList size={20} />} label="Description">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter product description"
              rows={4}
              className="w-full resize-none rounded-lg border border-borders-primary bg-secondary-light_grey px-4 py-3 outline-none transition-all focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
            />
          </InputWrapper>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InputWrapper icon={<DollarSign size={20} />} label="Price">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  required
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-borders-primary bg-secondary-light_grey py-3 pl-8 pr-4 outline-none transition-all focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                />
              </div>
            </InputWrapper>

            <InputWrapper
              icon={<LayoutGrid size={20} />}
              label="Available Quantity"
            >
              <input
                type="number"
                name="available_quantity"
                required
                value={formData.available_quantity}
                onChange={handleInputChange}
                placeholder="Enter quantity"
                className="w-full rounded-lg border border-borders-primary bg-secondary-light_grey px-4 py-3 outline-none transition-all focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
              />
            </InputWrapper>
          </div>

          <InputWrapper icon={<ImagePlus size={20} />} label="Product Images">
            <div
              className="cursor-pointer rounded-lg border-2 border-dashed border-borders-primary bg-secondary-light_grey p-6 text-center"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <ImagePlus className="mx-auto mb-2 text-primary-blue" size={32} />
              <p className="text-gray-500">
                Drag and drop your images here or click to browse
              </p>
              <input
                type="file"
                id="file-input"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Preview Section */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {previews.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Preview ${index + 1}`}
                  className="h-24 w-24 rounded-md object-cover"
                />
              ))}
            </div>
          </InputWrapper>
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="button"
            onClick={() => addModalRef.current?.close()}
            className="mr-4 rounded-lg px-6 py-3 font-bold text-accent-dark-blue transition-colors hover:bg-secondary-light_grey"
          >
            Cancel
          </button>
          {onUpdate && (
            <button
              type="button"
              onClick={() => {
                if (selectedProduct) {
                  // Toggle archive status directly on selectedProductData
                  const updatedProduct = {
                    ...selectedProduct,
                    archive: !selectedProductData?.archive, // Toggle the archive status
                  };

                  // Update the parent with the toggled archive state
                  onUpdate(updatedProduct);

                  // Update local state for the UI to reflect the change
                  setSelectedProductData(updatedProduct);
                }
              }}
              className="mr-4 flex items-center gap-2 rounded-lg bg-accent-dark-blue px-6 py-3 font-bold text-white transition-all duration-150 hover:opacity-80"
            >
              <Archive size={20} />
              {selectedProductData?.archive ? "Unarchive" : "Archive"}
            </button>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-accent-dark-blue px-6 py-3 font-bold text-white transition-all duration-150 hover:opacity-80"
          >
            <Package size={20} />
            {initialData?.name ? "Update Product" : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
