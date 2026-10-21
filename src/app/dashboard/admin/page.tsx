import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Administración</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Este módulo está en desarrollo.
        </p>
      </CardContent>
    </Card>
  )
}
