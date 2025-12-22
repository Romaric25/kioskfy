import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useOrganization } from "@/hooks/use-organizations.hook";

export const Teams = () => {
  const { organization } = useOrganization();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">membres dans l'équipe</p>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un membre
        </Button>
      </div>
      <div className="space-y-2">
        {organization?.data?.members?.map((member, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {member?.user?.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{member?.user?.email}</p>
                <p className="text-sm text-muted-foreground">
                  {member?.role === "owner" ? "Propriétaire" : "Membre"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button type="button" variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
