import axiosInstance from "@/modules/shared/services/axiosInstance";
import { Product } from "../types/product";
import { useState, useEffect } from "react";
import { Coins, DollarSign, Minus, Package, Plus } from "lucide-react";
import GenericCard from "@/modules/shared/GenericCard/GenericCard";
import defaultPhoto from "../assets/defaultPhoto.png";
import toast from "react-hot-toast";
import { Wallet2, CreditCard, House } from "lucide-react";
import { payWithStripe } from "../utils/payment";
interface AddressType {
  id?: string;
  street: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
}
interface CartItem {
  product: Product; // The product object
  quantity: number; // Quantity of the product
}
const defaultImage = defaultPhoto;
const Cart = () => {
  const [showAddAddress, setShowAddAddress] = useState(false); // Track visibility of Add Address section
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressType | null>(
    null,
  );
  const [newAddress, setNewAddress] = useState<AddressType>({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  const fetchAddresses = async () => {
    try {
      const response = await axiosInstance.get(`/users/tourists/addresses`);
      const addresses: AddressType[] = response.data.data.addresses.map(
        (item) => ({
          state: item.state,
          city: item.city,
          country: item.country,
          zip: item.zip,
          street: item.street,
          id: item._id,
        }),
      );
      setAddresses(addresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };
  const handleRedirect = () => {
    const baseLink = window.location.origin;
    // format the actual link
    const link: string = `${baseLink}/home/all-products/`;
    // redirect to the link
    window.location.href = link;
  };
  const handleNewAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToastId = toast.loading("Processing..."); // Show loading toast
    try {
      const zip = parseInt(newAddress.zip);
      if (isNaN(zip)) {
        toast.error("Please enter a valid ZIP code", { id: loadingToastId });
        return;
      }
      const requestBody = {
        address: {
          street: newAddress.street,
          city: newAddress.city,
          country: newAddress.country,
          zip: zip,
          state: newAddress.state,
        },
      };
      const response = await axiosInstance.post(
        `/users/tourists/addresses`,
        requestBody,
      );

      setAddresses((prev) => [
        ...prev,
        {
          ...newAddress,
          id: response.data.data.address_id,
        },
      ]);
      toast.success("Address added successfully", { id: loadingToastId });
      setShowAddAddress(false);
      setNewAddress({
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
      });
    } catch (error) {
      console.error("Error adding new address:", error);
      toast.error("Please fill all required fields correctly", {
        id: loadingToastId,
      });
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string[] }>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // State to store the clicked product
  const changeQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      newQuantity = 1; // Set the minimum quantity to 1
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product._id === productId
          ? { ...item, quantity: Math.max(newQuantity, 1) } // Ensure quantity is at least 1
          : item,
      ),
    );
  };
  const handleRemoveCart = async () => {
    if (selectedProduct) {
      setCart((prevCart) =>
        prevCart.filter((item) => item.product._id !== selectedProduct._id),
      );
      try {
        await axiosInstance.delete(`/users/cart/${selectedProduct._id}`);
        toast.success("Product removed from cart");
      } catch (error) {
        console.error("Error removing product from cart:", error);
        toast.error(`Failed to remove product from cart!`);
      }
    }
  };

  const handlePayment = async (paymentMethod: string) => {
    switch (paymentMethod) {
      case "cash":
      case "wallet":
        toast.promise(
          axiosInstance
            .post("/orders/checkout", {
              address_id: selectedAddress?.id,
              payment_method: paymentMethod,
            })
            .then(() => {
              setCart([]);
            }),
          {
            loading: "Processing...",
            success: "Order placed successfully",
            error: (error) => error.response.data.message,
          },
        );
        break;
      case "card":
        payWithStripe({
          address_id: selectedAddress?.id,
        });
        break;
      default:
        console.error("Invalid payment method");
    }
  };

  useEffect(() => {
    const fetchImages = async () => {
      const imagePromises = cart.map(async (item) => {
        const urls = await Promise.all(
          item.product.attachments.map(async (attachmentId) => {
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
        return { [item.product._id]: urls };
      });

      const results = await Promise.all(imagePromises);
      const imagesMap = results.reduce(
        (acc, curr) => ({ ...acc, ...curr }),
        {},
      );
      setImageUrls(imagesMap);
    };

    fetchImages();
  }, [cart]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axiosInstance.get(`/users/cart`);
        // Map the response to cart items structure
        const cart: CartItem[] =
          response.data.cart.map((item: CartItem) => ({
            product: item.product,
            quantity: item.quantity,
          })) || [];
        setCart(cart);
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };
    fetchCart();
  }, []);

  return (
    <div className="col-span-2 mr-10 mt-10 flex justify-end">
      <div className={customStyles.container}>
        <div className={customStyles.sliderContainer}>
          <div className={customStyles.sliderContent}>
            <div className={customStyles.sliderWrapper}>
              {cart.length === 0 && (
                <div className="text-center text-xl font-bold text-accent-dark-blue">
                  No products found
                </div>
              )}
              {cart.map((item, index) => (
                <div key={index} /*className={customStyles.slide}}*/>
                  <GenericCard
                    item={item.product}
                    onClick={() => {
                      handleRedirect();
                    }}
                    images={imageUrls[item.product._id] || [defaultImage]}
                    onRemove={() => {
                      setSelectedProduct(item.product);
                      handleRemoveCart();
                    }}
                  >
                    <div className="p-4">
                      {/* Price and Quantity Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-secondary-light_grey">
                          <div className="flex items-center gap-2 text-accent-dark-blue">
                            <DollarSign
                              size={16}
                              className="text-primary-blue"
                            />
                            <span className="text-sm font-sub_headings">
                              Price :
                            </span>
                          </div>
                          <p className="mt-1 text-lg font-semibold text-primary-green">
                            ${item.product.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-secondary-light_grey">
                          <div className="flex items-center gap-2 text-accent-dark-blue">
                            <Package size={16} className="text-primary-blue" />
                            <span className="text-sm font-sub_headings">
                              Purchased :
                            </span>
                          </div>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              changeQuantity(
                                item.product._id,
                                item.quantity - 1,
                              );
                            }}
                            className="p-1 text-gray-400 hover:text-gray-800"
                            disabled={item.quantity <= 1} // Disable button if quantity is already 1
                          >
                            <Minus size={20} />
                          </button>
                          <span className="px-3">{item.quantity}</span>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              changeQuantity(
                                item.product._id,
                                item.quantity + 1,
                              );
                            }}
                            className="p-1 text-gray-400 hover:text-gray-800"
                          >
                            <Plus size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </GenericCard>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="flex flex-col justify-end divide-y-2 divide-borders-bottomBorder p-10 text-text-primary">
          <div className="mx-auto mb-6 h-auto max-w-[85vh] rounded-lg bg-secondary-white p-4 pb-10 pl-20 pr-14 pt-4">
            <h3 className="text-lg font-bold">Delivery Address</h3>
            <div className="mt-4">
              {/* Select Existing Address */}
              {addresses.length > 0 && (
                <div>
                  <h4 className="text-md font-bold">Choose an Address:</h4>
                  <select
                    className="mt-2 rounded border bg-secondary-light_grey p-2"
                    value={selectedAddress?.id || ""}
                    onChange={(e) =>
                      setSelectedAddress(
                        addresses.find((addr) => addr.id === e.target.value) ||
                        null,
                      )
                    }
                  >
                    <option value="">Select an address</option>
                    {addresses.map((address) => (
                      <option key={address.id} value={address.id}>
                        {`${address.street}, ${address.city}, ${address.state ? address.state + ", " : ""}${address.zip}, ${address.country}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="btn btn-link text-md dropdown-toggle font-bold hover:underline"
                >
                  Add a New Address
                </button>
              </div>
              {/* Add New Address */}
              {showAddAddress && (
                <div className="mt-4">
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Street"
                      required
                      value={newAddress.street}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, street: e.target.value })
                      }
                      className="rounded-lg border border-borders-primary bg-secondary-light_grey px-4 py-3 outline-none transition-all focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      required
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      className="rounded-lg border border-borders-primary bg-secondary-light_grey px-4 py-3 outline-none transition-all focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={newAddress.state}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, state: e.target.value })
                      }
                      className="rounded-lg border border-borders-primary bg-secondary-light_grey px-4 py-3 outline-none transition-all focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                    />
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      required
                      value={newAddress.zip}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, zip: e.target.value })
                      }
                      className="rounded-lg border border-borders-primary bg-secondary-light_grey px-4 py-3 outline-none transition-all focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      required
                      value={newAddress.country}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          country: e.target.value,
                        })
                      }
                      className="rounded-lg border border-borders-primary bg-secondary-light_grey px-4 py-3 outline-none transition-all focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                    />
                  </div>
                </div>
              )}
            </div>
            {showAddAddress && (
              <div className="col-span-1 flex justify-end">
                <button
                  onClick={handleNewAddressSubmit}
                  className="ml-4 flex items-center gap-3 rounded-lg bg-accent-dark-blue px-8 py-4 text-lg font-bold text-white transition-all duration-150 hover:opacity-80"
                >
                  <House size={20} />
                  Add Address
                </button>
              </div>
            )}
            {selectedAddress && (
              <div className="col-span-2 flex justify-end">
                {/* cash on delivery */}
                <button
                  className="mr-4 mt-10 flex items-center gap-3 rounded-lg bg-accent-gold px-8 py-4 text-lg font-bold transition-all duration-150 hover:opacity-80"
                  onClick={() => handlePayment("cash")}
                >
                  <Coins size={30} />
                  Cash On Delivery
                </button>
                <button
                  className="mr-4 mt-10 flex w-fit items-center gap-3 rounded-lg bg-accent-gold px-8 py-4 text-lg font-bold transition-all duration-150 hover:opacity-80"
                  onClick={() => handlePayment("wallet")}
                >
                  <Wallet2 size={30} />
                  Pay By Wallet
                </button>
                <button
                  className="ml-4 mt-10 flex items-center gap-3 rounded-lg bg-accent-gold px-8 py-4 text-lg font-bold transition-all duration-150 hover:opacity-80"
                  onClick={() => handlePayment("card")}
                >
                  <CreditCard size={30} />
                  Pay Online
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
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
export default Cart;
