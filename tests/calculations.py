import numpy as np

# Inputs: All historical bets, bets for the current poll, evaluations

# Example historical bets
historical_bets = (
    np.array([0.6, 0.2, 0.8, 0.6]),
    np.array([0, 1, 0.2, 0.4, 0.6]),
)

# Example evaluations (1 for correct, 0 for incorrect)
historical_evaluations = (np.array([1, 0, 1, 0]), np.array([0, 1, 0]))

# Example current bets
current_bets = (np.array([0.7, 1, 0.8, 0.5]), np.array([0.2, 0.4]))

# There are no current evaluations, because the evaluation phase is after betting phase


# Calculate: Bias adjusted bets
# https://en.wikipedia.org/wiki/Bias_of_an_estimator#Definition
# Where every bet has equal probability, so it's just divided by 1/n, hence the error_sum being just the average
def bias_estimation(historical_bets, historical_evaluations):
    bias = 0
    for i in range(len(historical_bets)):
        assert 0 <= historical_bets[i] <= 1, "Bets must be between 0 and 1"

        # Make sure the evaluation exists
        if i < len(
            historical_evaluations
        ):  # Some bets might not have been evaluated yet
            bias += historical_bets[i] - historical_evaluations[i]

    return bias / len(historical_bets)


def bias_estimation_all(historical_bets, historical_evaluations):
    biases = []
    for i in range(len(historical_bets)):
        biases.append(bias_estimation(historical_bets[i], historical_evaluations[i]))
    return biases


bias = np.array(bias_estimation_all(historical_bets, historical_evaluations))
print(bias)



# Edgecase: All bets are the same
# Edgecase: No bets have been done
# Edgecase: One better has made no bets
# Edgecase: One better has made all bets
# Edgecase: Evaluation has reached 50% on the vote (in this instance it counts as not evaluated)

# Calculate e's
# Calculate covariance matrix
# Calculate k's
# Make sure dot product is 1
# All in Loke's paper
