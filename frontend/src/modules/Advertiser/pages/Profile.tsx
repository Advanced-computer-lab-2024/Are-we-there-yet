import { LoaderFunctionArgs } from "react-router";

import { fieldNames } from "../../shared/constants/inputNames";
import { getUser } from "../../shared/services/apiGetUserInfo";
import NewProf from "@/modules/shared/components/NewProf";
import { updateUser } from "@/modules/shared/services/apiUpdateUser";
import { useContext } from "react";
import { UserContext } from "@/modules/shared/store/user-context";

export default function Profile() {
  const { user } = useContext(UserContext);

  return (
    <NewProf
      accountTypeNeededInAPICall={true}
      endpoint={updateUser}
      fieldsIncludeNationality={true}
      APICallFields={[
        fieldNames.hotline,
        fieldNames.link,
        fieldNames.email,
        fieldNames.password,
      ]}
      mappingNeeded
      initialFormValues={{
        Hotline: user.hotline || "",
        Link: user.website || "",
        Email: user.email || "",
        Password: "",
      }}
    />
  );
}

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.id) {
    throw new Error("User ID is required");
  }

  const res = await getUser(params.id);

  const data = res.data;

  return data;
}
