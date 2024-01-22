import React from 'react';
import { Box, Text, Stack, Progress, HStack } from '@chakra-ui/react';

interface Trade {
  total: number;
  settled: number;
  dates: string[];
  splits: number[];
  settledDates: boolean[];
  paymentClosed: boolean;
}

const TradeList: React.FC<{ trades: Trade[] }> = ({ trades }) => {
  return (
    <Stack spacing={4}>
      {trades.map((trade, index) => (
        <Box key={index} p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">Trade {index + 1}</Text>
          <HStack spacing={4} align="center">
            <Progress value={(trade.settled / trade.total) * 100} size="sm" w="80%" />
            <Text fontWeight={"bold"}>${trade.total}</Text>
          </HStack>
          <Stack spacing={2}>
            {trade.dates.map((date, i) => (
              <Box fontSize={"xs"} key={i} color={trade.settledDates[i] ? (trade.settled ? "gray" : "red") : "white"}>
                {date} - ${trade.splits[i]}
              </Box>
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};

export default TradeList;