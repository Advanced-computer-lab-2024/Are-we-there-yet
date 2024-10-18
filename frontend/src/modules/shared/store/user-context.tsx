import { createContext, useState } from "react";
import { AccountType, UserType } from "../types/User.types";

type UserContextObj = {
  user: UserType;
  setUser: (user: UserType) => void;
};

export const UserContext = createContext<UserContextObj>({
  user: {
    _id: "",
    password: "",
    username: "",
    account_type: AccountType.None,
  },
  setUser: () => {},
});

const UserContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<UserType>({
    _id: "",
    password: "",
    username: "",
    account_type: AccountType.None,
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
