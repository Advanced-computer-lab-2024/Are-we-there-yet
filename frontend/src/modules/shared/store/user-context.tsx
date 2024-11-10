import React, { createContext, useState } from "react";
import { AccountType, UserType } from "../types/User.types";

type UserContextObj = {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
};

export const UserContext = createContext<UserContextObj>({
  user: {
    _id: "",
    password: "",
    username: "",
    account_type: AccountType.None,
    accepted: false,
    rejected: false,
    deletionRequested: false,
    termsAndConditions: false,
  },
  setUser: () => { },
});

const UserContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<UserType>({
    _id: "",
    password: "",
    username: "",
    account_type: AccountType.None,
    accepted: false,
    rejected: false,
    deletionRequested: false,
    termsAndConditions: false,
  });

  const contextValue: UserContextObj = {
    user: user,
    setUser: setUser,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export default UserContextProvider;
