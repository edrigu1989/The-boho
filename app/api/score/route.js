export async function POST(request) {
  try {
    const formData = await request.json();
    
    // Calculate total score
    let totalScore = 0;
    Object.values(formData).forEach((field) => {
      totalScore += field.points;
    });
    
    // Determine classification
    let classification = '';
    let background = '';
    
    if (totalScore >= 80) {
      classification = 'Hot Lead';
      background = '#040e00'; // Dark green
    } else if (totalScore >= 50) {
      classification = 'Warm Lead';
      background = '#c8bbab'; // Medium beige
    } else {
      classification = 'Cold Lead';
      background = '#800000'; // Dark red
    }
    
    // Return the result
    return new Response(
      JSON.stringify({
        score: totalScore,
        classification,
        background,
        formData,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to calculate score',
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 