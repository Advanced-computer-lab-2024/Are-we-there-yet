import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { ChevronLeft, ChevronRight, Minus } from "lucide-react";

interface TagType {
  _id: string | number;
  name: string;
}

type CommonProperties = {
  _id: string;
  name: string;
  category?: string;
  tags?: TagType[];
};

type CardProps<T extends CommonProperties> = {
  item: T;
  images?: string[];
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement>, item: T) => void;
  onRemove?: (id: string) => void;
};

const GenericCard = <T extends CommonProperties>({
  item,
  images,
  className = "",
  children,
  onClick,
  onRemove,
}: CardProps<T>) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  console.log(className);

  const nextImage = useCallback(() => {
    if (images && images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  }, [images]);

  const previousImage = useCallback(() => {
    if (images && images.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length,
      );
    }
  }, [images]);

  const renderTags = useMemo(() => {
    if (!item?.tags || item.tags.length === 0) return null;
    return (
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {item.tags.slice(0, 3).map((tag, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {tag.name ?? ""}
          </Badge>
        ))}
        {item.tags.length > 3 && (
          <Badge variant="secondary" className="text-xs">
            +{item.tags.length - 3}
          </Badge>
        )}
      </div>
    );
  }, [item.tags]);

  const renderImageSlider = () => {
    if (!images || images.length === 0) {
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-green to-primary-blue" />
      );
    }

    return (
      <div className="group relative h-full w-full">
        <img
          src={images[currentImageIndex]}
          alt={`${item.name || "Item"} Image ${currentImageIndex + 1}`}
          className="h-full w-full object-cover transition-opacity duration-300"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                previousImage();
              }}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-1 text-white opacity-0 transition-opacity duration-200 hover:bg-black/50 group-hover:opacity-100"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-1 text-white opacity-0 transition-opacity duration-200 hover:bg-black/50 group-hover:opacity-100"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`h-2 w-2 rounded-full transition-all duration-200 ${
                    index === currentImageIndex
                      ? "w-4 bg-primary-green"
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <Card
      onClick={(e) => onClick?.(e, item)}
      className={`min-h-[500px] w-80 overflow-hidden rounded-lg shadow-lg transition-shadow duration-300 hover:shadow-xl hover:shadow-primary-green ${className}`}
    >
      <div className="relative h-48 overflow-hidden">
        {renderImageSlider()}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary-light_grey via-transparent"></div>
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent bubbling
              onRemove(item._id); // Call the onRemove function with item ID
            }}
            className="absolute right-2 top-2 z-10 rounded-full border border-gray-500 bg-white p-1 duration-150 hover:bg-red-600 focus:outline-none"
          >
            <Minus
              size={16}
              className="text-accent-dark-blue duration-150 group-hover:stroke-black"
            />
          </button>
        )}
      </div>

      <CardContent className="space-y-4 bg-secondary-light_grey p-6 text-center">
        <h3 className="text-headline font-headline text-accent-dark-blue">
          {item.name || "Untitled"}
        </h3>
        <p className="text-sub-headings font-sub_headings text-primary-blue">
          {item.category ?? "Product"}
        </p>
        <span className="text-body text-text-primary">{children}</span>
        {renderTags}
      </CardContent>
    </Card>
  );
};

export default GenericCard;
