import { useLoaderData } from "react-router";
import { LoaderFunctionArgs } from "react-router";
import NewProf from "../../shared/components/NewProf";
import { updateUser } from "@/modules/shared/services/apiUpdateUser";
import { fieldNames } from "@/modules/shared/constants/inputNames";
import { UserContext } from "@/modules/shared/store/user-context";
import { useContext } from "react";
import axiosInstance from "@/modules/shared/services/axiosInstance";
import { ApiResponse } from "@/modules/shared/types/Response.types";
import { TagType } from "@/modules/shared/types/Tag.types";

export default function Profile() {
  const { countries, tags } = useLoaderData() as {
    countries: { name: { common: string } }[];
    tags: TagType[];
  };
  const sortedCountries = countries.sort();

  const { user } = useContext(UserContext);

  return (
    <NewProf
      tags={tags}
      countries={sortedCountries}
      accountTypeNeededInAPICall={true}
      endpoint={updateUser}
      fieldsIncludeNationality={true}
      APICallFields={[
        fieldNames.email,
        fieldNames.password,
        fieldNames.dateOfBirth,
        fieldNames.mobileNumber,
        fieldNames.occupation,
        fieldNames.nationality,
        fieldNames.loyalty_points,
        fieldNames.wallet,
      ]}
      mappingNeeded
      initialFormValues={{
        Email: user.email || "",
        Password: "",
        "Date of Birth": user.dob?.slice(0, 10) || "",
        Mobile: user.mobile_number || "",
        Occupation: user.job || "",
        Nationality: user.nationality || "",
        loyalty_points:
          user.loyalty_points === undefined
            ? ""
            : user.loyalty_points?.toString(),
        Wallet: user.wallet === undefined ? "" : user.wallet?.toString(),
      }}
    />
  );
}

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.id) {
    throw new Error("User ID is required");
  }

  const countriesResponse = await fetch(`https://restcountries.com/v3.1/all`);
  const countriesData = await countriesResponse.json();

  const tags = (
    await axiosInstance.get<ApiResponse<{ tags: TagType[] }>>("/tags")
  ).data.data.tags;

  const data = {
    countries: countriesData,
    tags,
  };

  return data;
}
