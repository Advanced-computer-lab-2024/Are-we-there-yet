import React, { useState, useRef, useEffect } from "react";
import { Product } from "../types/product";
import { DollarSign, Package, Plus, ShoppingCart, Star } from "lucide-react";
import Modal, { ModalRef } from "./modal";
import ProductForm, { ProductFormDataSubmit } from "./ProductForm";
import defaultPhoto from "../assets/defaultPhoto.png";
// import mintBluePhoto from "../assets/mintBlue.jpg";
// import Xbox5 from "../assets/Xbox5.jpg";
import GenericCard from "../../shared/GenericCard/GenericCard";
import axiosInstance from "../../shared/services/axiosInstance";

interface ProductListProps {
  products: Product[]; // All products
  role: "admin" | "seller" | "tourist"; // Define user roles
  onEdit?: (product: Product) => void; // Admin/Seller functionality
  onDelete?: (productId: string) => void; // Admin/Seller functionality
  onCreate?: (productData: ProductFormDataSubmit) => void; // Admin/Seller functionality
}

const defaultImage = defaultPhoto;

const ProductList: React.FC<ProductListProps> = ({
  products,
  role,
  onCreate,
  onEdit,
  onDelete,
}) => {
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string[] }>({});
  const [searchQuery, setSearchQuery] = useState(""); // State for search input
  const [minPrice, setMinPrice] = useState<number | "">(""); // State for minimum price filter
  const [maxPrice, setMaxPrice] = useState<number | "">(""); // State for maximum price filter
  const [sortByRating, setSortByRating] = useState<"none" | "asc" | "desc">(
    "none",
  ); // State for sorting by rating
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // State to store the clicked product

  const EditmodalRef = useRef<ModalRef>(null); // Reference for modal
  const AddmodalRef = useRef<ModalRef>(null); // Reference for modal

  useEffect(() => {
    const fetchImages = async () => {
      const imagePromises = products.map(async (product) => {
        const urls = await Promise.all(
          product.attachments.map(async (attachmentId) => {
            try {
              const response = await axiosInstance.get(
                `/attachments/${attachmentId}`,
              );
              return response.data.url;
            } catch (error) {
              console.error(`Error fetching image for ${attachmentId}:`, error);
              return defaultPhoto; // Fallback to default photo on error
            }
          }),
        );
        return { [product._id]: urls };
      });

      const results = await Promise.all(imagePromises);
      const imagesMap = results.reduce(
        (acc, curr) => ({ ...acc, ...curr }),
        {},
      );
      setImageUrls(imagesMap);
    };

    fetchImages();
  }, [products]);

  // Function to toggle between sorting orders
  const toggleSortByRating = () => {
    if (sortByRating === "none") {
      setSortByRating("asc");
    } else if (sortByRating === "asc") {
      setSortByRating("desc");
    } else {
      setSortByRating("none");
    }
  };

  // Open the modal and set the selected product
  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    EditmodalRef.current?.open(); // Open the modal
  };
  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesPrice =
        (minPrice === "" || product.price >= minPrice) &&
        (maxPrice === "" || product.price <= maxPrice);
      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      const averageRatingA =
        a.reviews.length > 0
          ? a.reviews.reduce((sum, review) => sum + review.rating, 0) /
            a.reviews.length
          : 0;
      const averageRatingB =
        b.reviews.length > 0
          ? b.reviews.reduce((sum, review) => sum + review.rating, 0) /
            b.reviews.length
          : 0;
      if (sortByRating === "asc") {
        return averageRatingA - averageRatingB;
      }
      if (sortByRating === "desc") {
        return averageRatingB - averageRatingA;
      }
      return 0; // No sorting
    });

  return (
    <div className={customStyles.container}>
      {/* Search and Filter Controls */}
      <div className={customStyles.filterContainer}>
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={customStyles.searchBar}
        />
        <div className={customStyles.priceFilters}>
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value) || "")}
            className={customStyles.priceInput}
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value) || "")}
            className={customStyles.priceInput}
          />
        </div>
        {/* Button to toggle sort by rating */}
        <button
          onClick={toggleSortByRating}
          className={customStyles.sortButton}
        >
          Sort by Rating (
          {sortByRating === "none"
            ? "None"
            : sortByRating === "asc"
              ? "Asc"
              : "Desc"}
          )
        </button>
      </div>

      {/* Product List */}
      <div className={customStyles.sliderContainer}>
        <div className={customStyles.sliderContent}>
          <div className={customStyles.sliderWrapper}>
            {(role === "admin" || role === "seller") && (
              <div className={customStyles.slide}>
                <div
                  onClick={() => AddmodalRef.current?.open()}
                  className={customStyles.addSlideDiv}
                >
                  <Plus className={customStyles.addSlideIcon} />
                </div>
              </div>
            )}
            {filteredProducts.map((product, index) => (
              <div key={index} /*className={customStyles.slide}}*/>
                <GenericCard
                  item={product}
                  onClick={() => handleOpenModal(product)}
                  images={imageUrls[product._id] || [defaultImage]}
                  onRemove={onDelete}
                >
                  {/* Description Section */}
                  <div className="p-4">
                    {/* Description */}
                    <div className="rounded-lg bg-secondary-light_grey">
                      <p className="line-clamp-2 text-body text-gray-700">
                        {product.description}
                      </p>
                    </div>

                    {/* Price and Quantity Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-secondary-light_grey">
                        <div className="flex items-center gap-2 text-accent-dark-blue">
                          <DollarSign size={16} className="text-primary-blue" />
                          <span className="text-sm font-sub_headings">
                            Price :
                          </span>
                        </div>
                        <p className="mt-1 text-lg font-semibold text-primary-green">
                          ${product.price}
                        </p>
                      </div>

                      <div className="rounded-lg bg-secondary-light_grey">
                        <div className="flex items-center gap-2 text-accent-dark-blue">
                          <Package size={16} className="text-primary-blue" />
                          <span className="text-sm font-sub_headings">
                            Quantity :
                          </span>
                        </div>
                        <p className="mt-1 text-lg font-bold text-primary-blue">
                          {product.available_quantity}
                        </p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="rounded-lg bg-secondary-light_grey p-1">
                      <div className="flex items-center gap-2">
                        <Star
                          size={18}
                          className="text-accent-gold"
                          fill="currentColor"
                        />
                        <span className="font-bold text-accent-dark-blue">
                          {product.reviews.length > 0
                            ? (
                                product.reviews.reduce(
                                  (sum, review) => sum + review.rating,
                                  0,
                                ) / product.reviews.length
                              ).toFixed(1)
                            : "0"}
                          <span className="font-normal text-gray-500">/5</span>
                        </span>

                        <span className="ml-16 text-sm text-gray-500">
                          {product.reviews.length} reviews
                        </span>
                      </div>
                    </div>
                  </div>
                </GenericCard>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for showing product details */}
      <Modal
        ref={EditmodalRef}
        title={selectedProduct?.name || "Product Details"}
        onClose={() => setSelectedProduct(null)}
      >
        {selectedProduct && (
          <div className="p-6">
            {role === "tourist" && (
              <div className="space-y-6">
                {/* Description */}
                <div className="rounded-lg bg-secondary-light_grey p-4">
                  <h3 className="mb-2 font-sub_headings text-accent-dark-blue">
                    Description
                  </h3>
                  <p className="text-body">{selectedProduct.description}</p>
                </div>

                {/* Price and Quantity Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-secondary-light_grey p-4">
                    <h3 className="mb-2 font-sub_headings text-accent-dark-blue">
                      Price
                    </h3>
                    <p className="text-2xl font-bold text-primary-green">
                      ${selectedProduct.price}
                    </p>
                  </div>
                  <div className="rounded-lg bg-secondary-light_grey p-4">
                    <h3 className="mb-2 font-sub_headings text-accent-dark-blue">
                      Available
                    </h3>
                    <p className="text-2xl font-bold text-primary-blue">
                      {selectedProduct.available_quantity} units
                    </p>
                  </div>
                </div>

                {/* Rating Section */}
                <div className="rounded-lg bg-secondary-light_grey p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <Star className="text-accent-gold" fill="currentColor" />
                    <span className="text-xl font-bold">
                      {selectedProduct.reviews.length > 0
                        ? (
                            selectedProduct.reviews.reduce(
                              (sum, review) => sum + review.rating,
                              0,
                            ) / selectedProduct.reviews.length
                          ).toFixed(1)
                        : "0"}
                      /5
                    </span>
                  </div>

                  {/* Reviews */}
                  <div className="space-y-4">
                    <h3 className="font-sub_headings text-accent-dark-blue">
                      Reviews
                    </h3>
                    <div className="max-h-60 space-y-3 overflow-y-auto">
                      {selectedProduct.reviews.map((review, index) => (
                        <div
                          key={index}
                          className="rounded-lg bg-white p-3 shadow-sm"
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <Star
                              size={16}
                              className="text-accent-gold"
                              fill="currentColor"
                            />
                            <span className="font-bold">{review.rating}/5</span>
                          </div>
                          <p className="text-gray-600">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              {role === "tourist" && (
                <button className="flex items-center gap-2 rounded-lg bg-accent-dark-blue px-6 py-3 font-bold text-white transition-all duration-150 hover:opacity-80">
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
              )}
              {(role === "admin" || role === "seller") && (
                <ProductForm
                  addModalRef={EditmodalRef}
                  onUpdate={onEdit}
                  initialData={{
                    name: selectedProduct.name,
                    description: selectedProduct.description,
                    price: selectedProduct.price,
                    available_quantity: selectedProduct.available_quantity,
                    attachments: [],
                  }}
                  selectedProduct={selectedProduct}
                />
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal for adding a new product */}
      <Modal ref={AddmodalRef} title="Add Product">
        <div>
          <ProductForm addModalRef={AddmodalRef} onSubmit={onCreate} />
        </div>
      </Modal>
    </div>
  );
};

const customStyles = {
  container:
    "h-auto max-h-[85vh] bg-black bg-opacity-30 max-w-fit rounded-lg pr-14 pt-4 pl-20 pb-10 mx-auto",
  filterContainer: "flex items-center justify-between gap-4 mb-4",
  searchBar:
    "px-4 py-2 border border-gray-300 bg-secondary-light_grey rounded-lg w-[200px]",
  priceFilters: "flex gap-4",
  priceInput:
    "px-4 py-2 border border-gray-300 bg-secondary-light_grey rounded-lg w-[50%]",
  sortButton:
    "px-4 py-2 border border-gray-300 rounded-lg bg-accent-dark-blue text-white",
  sliderContainer: "relative",
  sliderContent: "overflow-hidden",
  sliderWrapper:
    "grid grid-cols-3 gap-10 max-h-[65vh] overflow-y-auto no-scrollbar", // Set a max height and make it scrollable
  slide: "w-[22%] h-[100%] flex-shrink-0 px-2 transition-all duration-600 m-6",
  slideContent: "h-[50vh] w-[35vh] overflow-auto  p-6 relative cursor-pointer",
  slideTitle: "mb-2 font-bold",
  slideText: "text-sm",
  navButton:
    "absolute top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-white bg-opacity-50 p-2 transition-all hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-black",
  removeButton:
    "absolute group top-2 right-2 z-10 rounded-full border border-gray-500 bg-background-button p-1 hover:bg-red-600 focus:outline-none duration-150",
  addSlideDiv:
    "flex items-center justify-center h-[50vh] w-[35vh] border-2 border-dashed border-gray-300 bg-transparent cursor-pointer hover:bg-gray-50 hover:opacity-50 transition-all duration-150",
  addSlideIcon: "text-gray-400 w-16 h-16",
  navigationButtons: "flex justify-between mt-4",
  endBeginButton:
    "px-4 py-2 rounded hover:opacity-70 focus:outline-none flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed",
  editButton: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600",
  editSection: "mt-4",
  productImage: "w-full h-[55%] object-cover mb-4",
};

export default ProductList;
