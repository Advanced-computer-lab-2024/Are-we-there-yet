import { Camera } from "lucide-react";
import { UserType } from "../types/User.types";

export default function ProfilePicAndName({
  user,
  isUploading,
  handleCameraClick,
  fileInputRef,
  handleFileChange,
}: {
  user: UserType;
  isUploading: boolean;
  handleCameraClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col items-center lg:items-center">
      <div className="relative">
        {user.profile_pic ? (
          <div className="h-40 w-40 overflow-hidden rounded-full border-4 border-white shadow-lg">
            <img
              src={user.profile_pic.url}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-40 w-40 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-primary-blue to-primary-green shadow-lg">
            <span className="text-4xl font-bold text-white">
              {user.username?.[0]?.toUpperCase() || "NA"}
            </span>
          </div>
        )}
        <button
          onClick={handleCameraClick}
          className="absolute bottom-2 right-2 rounded-full bg-white p-2 shadow-md transition-shadow hover:shadow-lg disabled:opacity-50"
          disabled={isUploading}
        >
          <Camera className="h-5 w-5 text-primary-blue" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          </div>
        )}
      </div>
      <h1 className="mt-4 text-2xl font-bold text-accent-dark-blue">
        {user.username}
      </h1>
      <p className="mt-1 text-primary-blue">
        {user.account_type.toLowerCase() === "tourguide"
          ? "Tour Guide"
          : user.account_type || "NA"}
      </p>
    </div>
  );
}
