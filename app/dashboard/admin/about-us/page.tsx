"use client";

import { Compass } from "lucide-react";
import AdminLayout from "@/components/adminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminCommunityPage from "../our-community/page";
import AboutGoalsPage from "../goals/page";
import MissionAndVisionPage from "../mission-and-vision/page";
import ObjectivesPage from "../objectives/page";

export default function AboutUsPage() {
    return (
        <AdminLayout>
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white border-b p-6 flex items-center gap-3">
                    <Compass className="text-blue-600" />
                    <div>
                        <h1 className="text-xl font-bold">About Us Customization</h1>
                        <p className="text-sm text-gray-500">Manage About Us sections</p>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto p-6">
                    <Tabs defaultValue="community">
                        <div className="flex justify-center items-center mb-10">
                            <TabsList className="grid grid-cols-2 lg:grid-cols-4 lg:max-w-3xl gap-x-4 w-full md:auto">
                                <TabsTrigger value="community">Community</TabsTrigger>
                                <TabsTrigger value="goals">Goals</TabsTrigger>
                                <TabsTrigger value="mission">Mission</TabsTrigger>
                                <TabsTrigger value="objectives">Objectives</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="community">
                            <AdminCommunityPage />
                        </TabsContent>

                        <TabsContent value="goals">
                            <AboutGoalsPage />
                        </TabsContent>
                        <TabsContent value="mission">
                            <MissionAndVisionPage />
                        </TabsContent>
                        <TabsContent value="objectives">
                            <ObjectivesPage />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AdminLayout>
    );
}
