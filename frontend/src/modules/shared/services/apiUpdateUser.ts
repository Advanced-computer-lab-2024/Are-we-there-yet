import { userRoles } from "../constants/roles";
import toast from "react-hot-toast";
import { fieldNames } from "../constants/inputNames";
import {
  isValidateMobileNumber,
  validateFormDataValue,
} from "../../Register/utils/helpers";
import { isValidateHotline } from "../utils/helpers";
import axiosInstance from "./axiosInstance";

export async function updateUser(
  id: string,
  data?: { [key: string]: FormDataEntryValue },
  previous_work?: {
    title: string;
    employmentType: string;
    company: string;
    startDate: string;
    endDate: string;
    location: string;
    locationType: string;
    description: string;
  }[],
  company_profile?: {
    industry: string;
    headquarters: string;
    specialties: string;
  },
  tags?: string[],
) {
  if (previous_work) {
    axiosInstance.patch(`/users/${id}`, {
      previous_work: previous_work,
    });
    return;
  }

  if (company_profile) {
    axiosInstance.patch(`/users/${id}`, {
      company_profile: company_profile,
    });
    return;
  }

  if (tags) {
    axiosInstance.patch(`/users/${id}`, {
      preferences: tags,
    });
    return;
  }

  if (
    data &&
    data[fieldNames.mobileNumber] &&
    !isValidateMobileNumber(data[fieldNames.mobileNumber])
  ) {
    return toast.error("Invalid mobile number");
  }

  if (
    data &&
    data.email &&
    validateFormDataValue(fieldNames.email, data.email as string) === false
  ) {
    return toast.error("Invalid email address");
  }

  if (
    data &&
    data.password &&
    validateFormDataValue(fieldNames.password, data.password as string) ===
      false
  ) {
    return toast.error(
      "Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character",
    );
  }

  if (
    data &&
    data[fieldNames.hotline] &&
    !isValidateHotline(data[fieldNames.hotline])
  ) {
    return toast.error("Invalid hotline number");
  }

  let APIReqObj;
  if (data) APIReqObj = prepareData(data, data["account_type"]);

  if (!APIReqObj) {
    return;
  }

  try {
    const resPromise = axiosInstance.patch(
      `/users/${id}`,
      APIReqObj,
    ) as Promise<unknown>;

    toast.promise(
      resPromise,
      {
        loading: "Updating Profile...",
        success: "Profile Updated Successfully",
        error: "Failed to update user",
      },
      {
        style: {
          minWidth: "250px",
          display: "absolute",
          backgroundColor: "white",
        },
      },
    );

    return await resPromise;
  } catch (error) {
    console.error("Error fetching user", error);
    throw error;
  }
}

function prepareData(
  data: { [key: string]: FormDataEntryValue },
  account_type: FormDataEntryValue,
) {
  const dataToSend: { [key: string]: FormDataEntryValue } = {};

  if (account_type === userRoles.tourist) {
    if (data["email"]) {
      if (!validateFormDataValue(fieldNames.email, data.email as string)) {
        return toast.error("Invalid email address");
      }
      dataToSend["email"] = data["email"];
    }
    if (data["dob"]) {
      dataToSend["dob"] = data["dob"];
    }
    if (data["job"]) {
      if (/\d/.test(data["job"] as string)) {
        return toast.error("Job field should not include numbers");
      }
      dataToSend["job"] = data["job"];
    }
    if (data["mobile_number"]) {
      dataToSend["mobile_number"] = data["mobile_number"];
    }

    if (data["nationality"]) {
      dataToSend["nationality"] = data["nationality"];
    }
    if (data["wallet"]) {
      dataToSend["wallet"] = data["wallet"];
    }
    if (data["profile_pic"]) {
      dataToSend["profile_pic"] = data["profile_pic"];
    }

    return dataToSend;
  }

  if (account_type === userRoles.tourGuide) {
    if (data["email"]) {
      if (!validateFormDataValue(fieldNames.email, data.email as string)) {
        return toast.error("Invalid email address");
      }
      dataToSend["email"] = data["email"];
    }
    if (data["mobile_number"]) {
      {
        dataToSend["mobile_number"] = data["mobile_number"];
      }
    }

    if (data["years_of_experience"]) {
      dataToSend["years_of_experience"] = data["years_of_experience"];
    }

    if (data["profile_pic"]) {
      dataToSend["profile_pic"] = data["profile_pic"];
    }
    if (data["previous_work"]) {
      dataToSend["previous_work"] = data["previous_work"];
    }
    return dataToSend;
  }

  if (account_type === userRoles.seller) {
    if (data["email"]) {
      if (!validateFormDataValue(fieldNames.email, data.email as string)) {
        return toast.error("Invalid email address");
      }
      dataToSend["email"] = data["email"];
    }
    if (data["description"]) {
      dataToSend["description"] = data["description"];
    }

    if (data["name"]) {
      dataToSend["username"] = data["name"];
    }

    if (data["profile_pic"]) {
      dataToSend["profile_pic"] = data["profile_pic"];
    }
    return dataToSend;
  }

  if (account_type === userRoles.advertiser) {
    if (data["email"]) {
      if (!validateFormDataValue(fieldNames.email, data.email as string)) {
        return toast.error("Invalid email address");
      }
      dataToSend["email"] = data["email"];
    }
    if (data[fieldNames.hotline]) {
      dataToSend["hotline"] = data[fieldNames.hotline];
    }

    if (data["website"]) {
      if (
        !(
          (data["website"] as string).includes("http://") ||
          (data["website"] as string).includes("https://") ||
          (data["website"] as string).includes("www.") ||
          (data["website"] as string).includes(".com")
        )
      ) {
        return toast.error("Invalid website address");
      }
      dataToSend["website"] = data["website"];
    }

    if (data["profile_pic"]) {
      dataToSend["profile_pic"] = data["profile_pic"];
    }
    return dataToSend;
  }
  return;
}
