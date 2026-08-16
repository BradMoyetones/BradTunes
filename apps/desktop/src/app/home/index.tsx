import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@xtunes/ui";

export default function Home() {
    return (
        <div>
            <Card className="bg-card/30">
                <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                </CardHeader>
                <CardContent>
                    <CardDescription>Card Content</CardDescription>
                </CardContent>
                <CardFooter>
                    <CardDescription>Card Footer</CardDescription>
                </CardFooter>
            </Card>
        </div>
    );
}
