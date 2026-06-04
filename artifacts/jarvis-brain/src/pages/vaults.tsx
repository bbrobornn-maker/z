import { useListVaults } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen, ChevronRight } from "lucide-react";
import { CreateVaultDialog } from "@/components/create-vault-dialog";

export default function Vaults() {
  const { data: vaults, isLoading } = useListVaults();

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Vaults</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vaults</h1>
          <p className="text-muted-foreground mt-1">Your knowledge collections</p>
        </div>
        <CreateVaultDialog />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {vaults?.map((vault) => (
          <Link key={vault.id} href={`/vaults/${vault.id}`}>
            <Card className="bg-card border-card-border hover:border-primary/50 transition-colors cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: vault.color ? `${vault.color}20` : "#6366f120" }}
                  >
                    <FolderOpen
                      className="h-6 w-6"
                      style={{ color: vault.color || "#6366f1" }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {vault.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {vault.description || "No description"}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-muted-foreground">
                        Updated {new Date(vault.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
