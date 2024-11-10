import { fieldNames } from "../../shared/constants/inputNames";
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
      fieldsIncludeNationality={false}
      APICallFields={[fieldNames.email, fieldNames.password]}
      mappingNeeded
      initialFormValues={{
        Email: user.email || "",
        Password: "",
      }}
    />
  );
}
