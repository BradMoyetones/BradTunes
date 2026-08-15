import { Button, Card, CardContent, CardDescription, CardTitle } from '@xtunes/ui';
export default function Home() {
    return (
        <div>
            Este es el home <br />
            <Button variant="destructive">Home</Button>

            <Card>
                <CardTitle>Card</CardTitle>
                <CardDescription>Card Description</CardDescription>
                <CardContent>
                    Card Content
                </CardContent>
            </Card>
        </div>
    );
}
