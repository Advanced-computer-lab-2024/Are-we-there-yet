import type { ModalRef } from "@/modules/products/components/modal";
import Modal from "@/modules/shared/components/Modal";
import type { TableColumn } from "@/modules/shared/components/Table";
import Table from "@/modules/shared/components/Table";
import axiosInstance from "@/modules/shared/services/axiosInstance";
import { UserContext } from "@/modules/shared/store/user-context";
import type { PromoCodeType } from "@/modules/shared/types/PromoCode.types";
import { useContext, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useLoaderData } from "react-router";

export default function AdminPromoCode() {
  const { user } = useContext(UserContext);
  const ref = useRef<ModalRef>(null);
  const [promocodes, setPromocodes] = useState(
    useLoaderData() as PromoCodeType[],
  );
  const tableColumns: TableColumn[] = [
    {
      accessor: "code",
      header: "Code",
      render: (code: string) => <span>{code}</span>,
    },
    {
      accessor: "discountPercentage",
      header: "Discount",
      render: (discount: number) => (
        <span className={`rounded-full bg-primary-green p-1`}>
          {discount}%{" "}
          {discount <= 10
            ? "👌"
            : discount <= 20
              ? "🔥"
              : discount <= 30
                ? "🎉"
                : discount <= 40
                  ? "🤩"
                  : discount <= 50
                    ? "🚀"
                    : discount <= 60
                      ? "🤯"
                      : discount <= 70
                        ? "🤑"
                        : discount <= 80
                          ? "🤗"
                          : discount <= 90
                            ? "🥳"
                            : discount <= 100
                              ? "🎊"
                              : "🤔"}
        </span>
      ),
    },
  ];

  const handleAddPromoCode = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = (
      e.currentTarget.elements.namedItem("code") as HTMLInputElement
    ).value;
    const discount = (
      e.currentTarget.elements.namedItem("discount") as HTMLInputElement
    ).value;
    toast.promise(
      axiosInstance
        .post("/promoCodes", { code, discountPercentage: discount })
        .then((res) => {
          setPromocodes((prev) => [...prev, res.data]);
          ref.current?.close();
        })
        .catch((err) => console.error(err)),
      {
        loading: "Adding promo code...",
        success: "Promo code added successfully!",
        error: "Failed to add promo code.",
      },
    );
  };

  const handleDeletePromoCode = (id: string) => {
    toast.promise(
      axiosInstance
        .delete(`/promoCodes/${id}`)
        .then(() => {
          setPromocodes((prev) => prev.filter((promo) => promo._id !== id));
        })
        .catch((err) => console.error(err)),
      {
        loading: "Deleting promo code...",
        success: "Promo code deleted successfully!",
        error: "Failed to delete promo code.",
      },
    );
  };

  return (
    <div className="container mx-auto space-y-5 p-4">
      <header className="flex items-center justify-between">
        <div className="flex flex-col py-14 text-primary-blue">
          <div className="w-full max-w-[50vw] divide-y-2 divide-primary-green">
            <h1 className="py-4 text-4xl font-bold">Welcome {user.username}</h1>
            <h3 className="py-4 text-2xl font-bold text-primary-blue">
              Promo Codes
            </h3>
          </div>
          <button
            className="rounded-md bg-primary-green px-4 py-2 text-white"
            onClick={() => ref.current?.open()}
          >
            Add Promo Code
          </button>
        </div>
      </header>
      <Table
        columns={tableColumns}
        data={promocodes}
        actions={{
          onDelete: handleDeletePromoCode,
        }}
      />
      <Modal ref={ref}>
        <div className="flex flex-col gap-4 p-4">
          <h1 className="text-2xl font-bold text-primary-blue">
            Add Promo Code
          </h1>
          <form onSubmit={handleAddPromoCode}>
            <input
              type="text"
              name="code"
              placeholder="Code"
              className="rounded-md border border-primary-green p-2"
            />
            <input
              type="number"
              name="discount"
              placeholder="Discount"
              className="rounded-md border border-primary-green p-2"
              min="1"
              max="100"
            />
            <button
              type="submit"
              className="rounded-md bg-primary-green px-4 py-2 text-white"
            >
              Add Promo Code
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
}

export async function loader() {
  return axiosInstance
    .get("/promoCodes")
    .then((res) => res.data);
}
