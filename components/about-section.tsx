"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, Home, Leaf, Award, Target, Globe, Loader2 } from "lucide-react"

interface CommunityItem {
  community_list: string
  community_card_icon: string
  community_card_number: string
  community_card_category: string
}

interface CommunityData {
  community_header: string
  community_title: string
  community_content: string
  community_list: string[]
  community_card_icon: string[]
  community_card_number: string[]
  community_card_category: string[]
}

interface ObjectiveData {
  objectives_header: string
  objectives_title: string
  objectives_description: string
  objectives_card_title: string[]
  objectives_card_content: string[]
}

interface MissionVisionData {
  mission_and_vision_header: string
  mission_and_vision_title: string
  mission_and_vision_description: string
  mission_content: string
  vision_content: string
}

interface GoalsData {
  goals_header: string
  goals_title: string
  goals_description: string
  goals_content: string
  goals_card_icon: string[]
  goals_card_title: string[]
  goals_card_content: string[]
  goals_card_list: string[]
}

export default function AboutSection() {
  const [communityData, setCommunityData] = useState<CommunityData | null>(null)
  const [objectivesData, setObjectivesData] = useState<ObjectiveData | null>(null)
  const [missionVisionData, setMissionVisionData] = useState<MissionVisionData | null>(null)
  const [goalsData, setGoalsData] = useState<GoalsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data: community, objectives, goals, and mission/vision
      const [communityRes, objectivesRes, missionVisionRes, goalsRes] = await Promise.all([
        fetch("/api/our-community"),
        fetch("/api/objectives"),
        fetch("/api/mission-and-vision"),
        fetch("/api/goals")
      ])

      // Handle community data
      if (communityRes.ok) {
        const communityJson = await communityRes.json()
        if (communityJson.success && communityJson.data) {
          const data = communityJson.data

          // Parse arrays if they come as JSON strings
          let lists = data.community_list || []
          let icons = data.community_card_icon || []
          let numbers = data.community_card_number || []
          let categories = data.community_card_category || []

          if (typeof lists === 'string') {
            try {
              lists = JSON.parse(lists)
            } catch (e) {
              console.error("Error parsing community lists:", e)
              lists = []
            }
          }
          if (typeof icons === 'string') {
            try {
              icons = JSON.parse(icons)
            } catch (e) {
              console.error("Error parsing community icons:", e)
              icons = []
            }
          }
          if (typeof numbers === 'string') {
            try {
              numbers = JSON.parse(numbers)
            } catch (e) {
              console.error("Error parsing community numbers:", e)
              numbers = []
            }
          }
          if (typeof categories === 'string') {
            try {
              categories = JSON.parse(categories)
            } catch (e) {
              console.error("Error parsing community categories:", e)
              categories = []
            }
          }

          // Ensure they're arrays
          if (!Array.isArray(lists)) lists = []
          if (!Array.isArray(icons)) icons = []
          if (!Array.isArray(numbers)) numbers = []
          if (!Array.isArray(categories)) categories = []

          const parsedData = {
            community_header: data.community_header || "",
            community_title: data.community_title || "",
            community_content: data.community_content || "",
            community_list: lists,
            community_card_icon: icons,
            community_card_number: numbers,
            community_card_category: categories
          }

          setCommunityData(parsedData)
        }
      }

      // Handle objectives data
      if (objectivesRes.ok) {
        const objectivesJson = await objectivesRes.json()
        if (objectivesJson.success && objectivesJson.data) {
          const data = objectivesJson.data

          let titles = data.objectives_card_title || []
          let contents = data.objectives_card_content || []

          if (typeof titles === 'string') {
            try {
              titles = JSON.parse(titles)
            } catch (e) {
              console.error("Error parsing titles:", e)
              titles = []
            }
          }

          if (typeof contents === 'string') {
            try {
              contents = JSON.parse(contents)
            } catch (e) {
              console.error("Error parsing contents:", e)
              contents = []
            }
          }

          if (!Array.isArray(titles)) titles = []
          if (!Array.isArray(contents)) contents = []

          const parsedData = {
            objectives_header: data.objectives_header || "",
            objectives_title: data.objectives_title || "",
            objectives_description: data.objectives_description || "",
            objectives_card_title: titles,
            objectives_card_content: contents
          }

          setObjectivesData(parsedData)
        }
      }

      // Handle mission/vision data
      if (missionVisionRes.ok) {
        const missionVisionJson = await missionVisionRes.json()
        if (missionVisionJson.success && missionVisionJson.data) {
          setMissionVisionData(missionVisionJson.data)
        }
      }

      // Handle goals data
      if (goalsRes.ok) {
        const goalsJson = await goalsRes.json()
        if (goalsJson.success && goalsJson.data) {
          const data = goalsJson.data

          let icons = data.goals_card_icon || []
          let titles = data.goals_card_title || []
          let contents = data.goals_card_content || []
          let lists = data.goals_card_list || []

          if (typeof icons === 'string') {
            try {
              icons = JSON.parse(icons)
            } catch (e) {
              console.error("Error parsing goals icons:", e)
              icons = []
            }
          }

          if (typeof titles === 'string') {
            try {
              titles = JSON.parse(titles)
            } catch (e) {
              console.error("Error parsing goals titles:", e)
              titles = []
            }
          }

          if (typeof contents === 'string') {
            try {
              contents = JSON.parse(contents)
            } catch (e) {
              console.error("Error parsing goals contents:", e)
              contents = []
            }
          }

          if (typeof lists === 'string') {
            try {
              lists = JSON.parse(lists)
            } catch (e) {
              console.error("Error parsing goals lists:", e)
              lists = []
            }
          }

          if (!Array.isArray(icons)) icons = []
          if (!Array.isArray(titles)) titles = []
          if (!Array.isArray(contents)) contents = []
          if (!Array.isArray(lists)) lists = []

          const parsedData = {
            goals_header: data.goals_header || "",
            goals_title: data.goals_title || "",
            goals_description: data.goals_description || "",
            goals_content: data.goals_content || "",
            goals_card_icon: icons,
            goals_card_title: titles,
            goals_card_content: contents,
            goals_card_list: lists
          }

          setGoalsData(parsedData)
        }
      }

    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-green-50" />
        <div className="max-w-7xl mx-auto relative z-10 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading content...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="about" className="mb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-green-50" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Community Section */}
        {communityData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-24 mb-24"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="inline-block mb-4"
              >
                <span className="px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm text-sm font-semibold bg-gradient-to-r from-green-600 via-red-600 to-[#800000]/90 bg-clip-text text-transparent">
                  {communityData.community_header}
                </span>
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-yellow-600 via-red-600 to-red-900 bg-clip-text text-transparent">
                  {communityData.community_title}
                </span>
              </h2>

              {communityData.community_content && (
                <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                  {communityData.community_content}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {Array.isArray(communityData.community_list) && communityData.community_list.map((item, index) => {
                // Map icon strings to actual icon components
                const iconMap: { [key: string]: React.ReactNode } = {
                  'Users': <Users className="w-6 h-6" />,
                  'Home': <Home className="w-6 h-6" />,
                  'Leaf': <Leaf className="w-6 h-6" />,
                  'Award': <Award className="w-6 h-6" />,
                  'Target': <Target className="w-6 h-6" />,
                  'Globe': <Globe className="w-6 h-6" />,
                }

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all border border-transparent hover:border-orange-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 via-red-600 to-[#800000]/90 flex items-center justify-center mx-auto mb-3 text-white">
                      {iconMap[communityData.community_card_icon[index]] || <Users className="w-6 h-6" />}
                    </div>
                    <h3 className="text-sm font-semibold text-center text-gray-700 mb-2">
                      {item}
                    </h3>
                    <div className="text-2xl font-bold text-center bg-gradient-to-r from-yellow-600 via-red-600 to-red-900 bg-clip-text text-transparent mb-1">
                      {communityData.community_card_number[index]}
                    </div>
                    <p className="text-xs text-center text-gray-600">
                      {communityData.community_card_category[index]}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Goals Section */}
        {goalsData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-24 mb-24"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="inline-block mb-4"
              >
                <span className="px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm text-sm font-semibold bg-gradient-to-r from-green-600 via-red-600 to-[#800000]/90 bg-clip-text text-transparent">
                  {goalsData.goals_header}
                </span>
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-yellow-600 via-red-600 to-red-900 bg-clip-text text-transparent">
                  {goalsData.goals_title}
                </span>
              </h2>

              {goalsData.goals_description && (
                <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-4">
                  {goalsData.goals_description}
                </p>
              )}

              {goalsData.goals_content && (
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  {goalsData.goals_content}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {Array.isArray(goalsData.goals_card_title) && goalsData.goals_card_title.map((title, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="p-8 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all border border-orange-200/50 hover:border-orange-300 group"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 via-red-600 to-[#800000]/90 flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-md">
                    <span className="text-xl font-bold">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-yellow-600 via-red-600 to-red-900 bg-clip-text text-transparent">
                    {title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    {goalsData.goals_card_content[index]}
                  </p>
                  {goalsData.goals_card_list && goalsData.goals_card_list[index] && (
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <span className="text-red-600 font-bold">•</span>
                        {goalsData.goals_card_list[index]}
                      </li>
                    </ul>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Mission & Vision Section */}
        {missionVisionData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-24 mb-24"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="inline-block mb-4"
              >
                <span className="px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm text-sm font-semibold bg-gradient-to-r from-green-600 via-red-600 to-[#800000]/90 bg-clip-text text-transparent">
                  {missionVisionData.mission_and_vision_header}
                </span>
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-yellow-600 via-red-600 to-red-900 bg-clip-text text-transparent">
                  {missionVisionData.mission_and_vision_title}
                </span>
              </h2>

              {missionVisionData.mission_and_vision_description && (
                <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                  {missionVisionData.mission_and_vision_description}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Mission Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="p-8 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all border border-orange-200/50 hover:border-orange-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-400 via-red-600 to-[#800000]/90 flex items-center justify-center shadow-lg">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 via-red-600 to-red-900 bg-clip-text text-transparent">
                    Mission
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {missionVisionData.mission_content}
                </p>
              </motion.div>

              {/* Vision Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="p-8 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all border border-orange-200/50 hover:border-orange-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-400 via-red-600 to-[#800000]/90 flex items-center justify-center shadow-lg">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 via-red-600 to-red-900 bg-clip-text text-transparent">
                    Vision
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {missionVisionData.vision_content}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Objectives Section */}
        {objectivesData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-24"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="inline-block mb-4"
              >
                <span className="px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm text-sm font-semibold bg-gradient-to-r from-green-600 via-red-600 to-[#800000]/90 bg-clip-text text-transparent">
                  {objectivesData.objectives_header}
                </span>
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-yellow-600 via-red-600 to-red-900 bg-clip-text text-transparent">
                  {objectivesData.objectives_title}
                </span>
              </h2>

              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                {objectivesData.objectives_description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {Array.isArray(objectivesData.objectives_card_title) && objectivesData.objectives_card_title.map((title, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ x: 8, scale: 1.02 }}
                  className="relative p-8 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-gradient-to-b from-yellow-500 via-red-600 to-[#800000]/90 group"
                >
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 via-red-600 to-[#800000]/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <span className="text-white font-bold text-xl">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-yellow-600 via-red-600 to-red-900 bg-clip-text text-transparent">
                        {title}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {objectivesData.objectives_card_content[index]}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-red-300/20 via-orange-300/20 to-green-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-br from-green-300/20 via-orange-300/20 to-red-300/20 rounded-full blur-3xl" />
    </section>
  )
}