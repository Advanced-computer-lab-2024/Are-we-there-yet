import MuseumList from "../components/MuseumList";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "../../shared/store/user-context";
import {
  createMuseum,
  deleteMuseum,
  updateMuseum,
  getMuseums,
} from "../Api/MuseumService";
import { MuseumFormData } from "../components/MuseumForm";
import { Museum } from "../types/museum";
import Greeting from "@/modules/shared/components/Greeting";

const AllMuseums = () => {
  const [museums, setMuseums] = useState<Museum[]>([]);
  const { user } = useContext(UserContext);
  useEffect(() => {
    const fetchMuseums = async () => {
      const data = await getMuseums();
      setMuseums(data);
    };
    fetchMuseums();
  }, []);

  const handleCreate = async (museumData: MuseumFormData) => {
    const museum = {
      name: museumData.name,
      description: museumData.description,
      category: museumData.category,
      tags: museumData.tags,
      pictures: museumData.pictures,
      location: museumData.location,
      opening_hours: museumData.opening_hours,
      ticket_prices: {
        foreigner: museumData.ticket_prices.foreigner,
        native: museumData.ticket_prices.native,
        student: museumData.ticket_prices.student,
      },
    };
    await createMuseum(museum);
    const Museums = await getMuseums();
    setMuseums(Museums);
  };

  const handleEdit = async (museumData: Museum) => {
    const museum = {
      _id: museumData._id,
      name: museumData.name,
      description: museumData.description,
      category: museumData.category,
      tags: museumData.tags,
      pictures: museumData.pictures,
      location: museumData.location,
      opening_hours: museumData.opening_hours,
      ticket_prices: {
        foreigner: museumData.ticket_prices.foreigner,
        native: museumData.ticket_prices.native,
        student: museumData.ticket_prices.student,
      },
    };
    await updateMuseum(museum._id, museum);
    const Museums = await getMuseums();
    setMuseums(Museums);
  };

  const handleDelete = async (museumId: string) => {
    await deleteMuseum(museumId);
    setMuseums(museums.filter((m) => m._id !== museumId));
  };

  return (
    <div>
      <div className="flex flex-col justify-end divide-y-2 divide-borders-bottomBorder p-9 text-text-primary">
      <Greeting name = {user.username} title="Museums" signedIn />
      </div>
      <MuseumList
        museums={museums}
        role="TourismGovernor"
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AllMuseums;
