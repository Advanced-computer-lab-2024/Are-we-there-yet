import React, { useState } from "react";
import { UserType } from "@/modules/shared/types/User.types";
import { Globe, Mail, Phone, Building2, MapPin, Tags } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateUser } from "@/modules/shared/services/apiUpdateUser";

export default function AdvertiserProfile({ user }: { user: UserType }) {
  const [companyProfile, setCompanyProfile] = useState(
    user.company_profile || {
      industry: "",
      headquarters: "",
      specialties: "",
    },
  );

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setCompanyProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log(companyProfile);
    // Handle form submission here
    await updateUser(user._id, undefined, undefined, companyProfile);

    setIsEditing(false);
  };

  return (
    <div className="w-full space-y-8 pt-10">
      {/* Contact Details Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-accent-dark-blue">
            Contact Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail className="h-5 w-5 flex-shrink-0 text-primary-blue" />
              <span className="truncate">{user.email || "NA"}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Phone className="h-5 w-5 flex-shrink-0 text-primary-blue" />
              <span>{user.hotline || "NA"}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Globe className="h-5 w-5 flex-shrink-0 text-primary-blue" />
              <span>{user.website || "NA"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Profile Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-accent-dark-blue">
            Company Profile
          </CardTitle>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="h-8"
          >
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Building2 className="h-4 w-4" />
                  <label htmlFor="industry">Industry</label>
                </div>
                {isEditing ? (
                  <Input
                    id="industry"
                    name="industry"
                    value={companyProfile.industry}
                    onChange={handleChange}
                    placeholder="Enter your industry"
                    className="max-w-md"
                  />
                ) : (
                  <p className="text-slate-600">
                    {companyProfile.industry || "Not specified"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <label htmlFor="headquarters">Headquarters</label>
                </div>
                {isEditing ? (
                  <Input
                    id="headquarters"
                    name="headquarters"
                    value={companyProfile.headquarters}
                    onChange={handleChange}
                    placeholder="Enter your headquarters location"
                    className="max-w-md"
                  />
                ) : (
                  <p className="text-slate-600">
                    {companyProfile.headquarters || "Not specified"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Tags className="h-4 w-4" />
                  <label htmlFor="specialities">Specialties</label>
                </div>
                {isEditing ? (
                  <Textarea
                    id="specialties"
                    name="specialties"
                    value={companyProfile.specialties}
                    onChange={handleChange}
                    placeholder="Enter your company specialties"
                    className="max-w-md"
                  />
                ) : (
                  <p className="text-slate-600">
                    {companyProfile.specialties || "Not specified"}
                  </p>
                )}
              </div>
            </div>

            {isEditing && (
              <Button type="submit" className="w-24">
                Save
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
