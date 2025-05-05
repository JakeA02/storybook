import { useState } from "react";
import { useStory } from "../../context/index";
import { CreditCard, Truck, Package, Check } from "lucide-react";

export default function Checkout() {
  const { compiledBook, storyDetails } = useStory();
  const [checkoutStep, setCheckoutStep] = useState("details");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitDetails = (e) => {
    e.preventDefault();
    setCheckoutStep("payment");
  };

  const handleSubmitPayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setOrderComplete(true);
      setOrderId(`ORD-${Date.now().toString().slice(-6)}`);
    }, 2000);
  };

  // Book details and pricing info
  const bookInfo = {
    title: compiledBook?.title || `${storyDetails?.childName}'s Story`,
    pages: compiledBook?.pages || 12,
    format: "Hardcover",
    price: 29.99,
    shipping: 4.99,
    tax: 2.75,
    total: 37.73
  };

  // Render different stages of checkout
  const renderCheckoutStep = () => {
    if (orderComplete) {
      return (
        <div className="text-center py-8">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Order Complete!</h3>
          <p className="mb-4">Thank you for your order. Your book is being prepared.</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <p className="font-medium">Order Number: {orderId}</p>
            <p className="text-sm text-gray-600">A confirmation email has been sent to {formData.email}</p>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => window.location.href = "/"}
              className="px-5 py-2.5 border border-primary text-primary rounded-full hover:bg-primary hover:text-white transition-colors"
            >
              Return Home
            </button>
            <button
              onClick={() => window.open("/order-status")}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-400 to-rose-400 text-white rounded-full"
            >
              Track Order
            </button>
          </div>
        </div>
      );
    }

    if (checkoutStep === "details") {
      return (
        <form onSubmit={handleSubmitDetails} className="max-w-xl mx-auto">
          <h3 className="text-xl font-medium mb-4">Shipping Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Street Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Zip Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              <span>Continue to Payment</span>
              <CreditCard className="w-4 h-4" />
            </button>
          </div>
        </form>
      );
    }
    
    if (checkoutStep === "payment") {
      return (
        <form onSubmit={handleSubmitPayment} className="max-w-xl mx-auto">
          <h3 className="text-xl font-medium mb-4">Payment Information</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name on Card</label>
            <input
              type="text"
              name="cardName"
              value={formData.cardName}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Card Number</label>
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleInputChange}
              placeholder="XXXX XXXX XXXX XXXX"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date</label>
              <input
                type="text"
                name="expiry"
                value={formData.expiry}
                onChange={handleInputChange}
                placeholder="MM/YY"
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CVV</label>
              <input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                placeholder="XXX"
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setCheckoutStep("details")}
              className="px-5 py-2 border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-2 bg-gradient-to-r from-sky-400 to-rose-400 text-white rounded-full hover:brightness-105 transition flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span>Processing...</span>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                </>
              ) : (
                <>
                  <span>Complete Order</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      );
    }
  };

  return (
    <div className="checkout-container">
      <h2 className="text-2xl font-bold mb-4 text-center">Checkout</h2>
      <p className="text-center mb-8 font-story">
        Complete your order to receive your personalized storybook
      </p>

      {!orderComplete && (
        <div className="checkout-steps mb-6 flex justify-center">
          <div className={`step flex items-center ${checkoutStep === "details" ? "text-primary" : "text-gray-500"}`}>
            <div className={`step-number w-8 h-8 rounded-full flex items-center justify-center mr-2 ${checkoutStep === "details" ? "bg-primary text-white" : "bg-gray-200"}`}>
              1
            </div>
            <span className="hidden md:inline">Shipping</span>
          </div>
          <div className="step-line w-12 h-px bg-gray-300 mx-2"></div>
          <div className={`step flex items-center ${checkoutStep === "payment" ? "text-primary" : "text-gray-500"}`}>
            <div className={`step-number w-8 h-8 rounded-full flex items-center justify-center mr-2 ${checkoutStep === "payment" ? "bg-primary text-white" : "bg-gray-200"}`}>
              2
            </div>
            <span className="hidden md:inline">Payment</span>
          </div>
          <div className="step-line w-12 h-px bg-gray-300 mx-2"></div>
          <div className="step flex items-center text-gray-500">
            <div className="step-number w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
              3
            </div>
            <span className="hidden md:inline">Confirmation</span>
          </div>
        </div>
      )}

      <div className="checkout-layout grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {renderCheckoutStep()}
        </div>
        
        <div className="order-summary bg-gray-50 p-4 rounded-lg h-fit">
          <h3 className="text-lg font-medium mb-4 pb-2 border-b">Order Summary</h3>
          
          <div className="flex items-start mb-4">
            <div className="bg-gray-200 rounded w-16 h-16 flex items-center justify-center mr-3">
              <Package className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <h4 className="font-medium">{bookInfo.title}</h4>
              <p className="text-sm text-gray-600">{bookInfo.pages} pages, {bookInfo.format}</p>
            </div>
          </div>
          
          <div className="price-details space-y-2 mb-4 pb-4 border-b">
            <div className="flex justify-between">
              <span>Book Price:</span>
              <span>${bookInfo.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>${bookInfo.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${bookInfo.tax.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>${bookInfo.total.toFixed(2)}</span>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-4 h-4" />
              <span>Free shipping for orders over $50</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>Estimated delivery: 7-10 business days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 