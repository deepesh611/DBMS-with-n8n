export const uploadImage = async (file: File): Promise<string> => {
  // For now, return a mock file path since n8n upload workflow isn't set up
  // In production, this would upload to your n8n webhook
  const mockPath = `/uploads/mock-${Date.now()}.jpg`
  
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return mockPath
}