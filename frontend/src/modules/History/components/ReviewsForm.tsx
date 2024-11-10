import React, { useEffect, useState} from "react";
import { toast } from "react-hot-toast";

interface ReviewsFormProps {
  objectType: string;
  objectId: string;
  initialValues?: { rating: number; comment: string };
  onClose: () => void;
  onSubmit: (modelType: string, modelId: string, review: { rating: number; comment: string },) => Promise<void>;
}

const ReviewsForm: React.FC<ReviewsFormProps> = ({
  objectType,
  objectId,
  initialValues = { rating: 0, comment: "" }, // default to empty values
  onClose,
  onSubmit,
}) => {
 const [rating, setRating] = useState<number>(initialValues.rating);
  const [comment, setComment] = useState<string>(initialValues.comment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(objectType, objectId, { rating, comment }, );
      onClose();
    } catch (error) {
      toast.error("An error occurred while submitting the review.");
    }
  };
  useEffect(() => {
    // Update the form values if initialValues change
    setRating(initialValues.rating);
    setComment(initialValues.comment);
  }, [initialValues]);
  
  const handleStarClick = (value: number) => {
    setRating(value);
  };


  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 p-4">
      <h2 className="text-lg font-bold">{"New Review"}</h2>
      
      <label>
        <span>Rating</span>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleStarClick(value)}
              className={`text-4xl ${rating >= value ? "text-yellow-500" : "text-gray-400"}`}
            >
              ★
            </button>
          ))}
        </div>
      </label>
      
      <label>
        <span>Comment</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          rows={4}
          className="border p-2 rounded w-full"
        />
      </label>

      <div className="flex justify-end space-x-2 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="mr-4 rounded-lg px-6 py-3 font-bold text-accent-dark-blue transition-colors hover:bg-secondary-light_grey"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-accent-dark-blue px-6 py-3 font-bold text-white transition-all duration-150 hover:opacity-80"
        >
          {"Submit Review"}
        </button>
      </div>
    </form>
  );
};

export default ReviewsForm;
