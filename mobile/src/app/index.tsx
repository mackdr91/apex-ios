/**
 * Author: Domonick Mack
 * Date: 2026-11-02
 * Description: Primary dashboard screen displaying containerized backend health, PostgreSQL connectivity, and HIG system metrics.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppleHIGColors, Spacing, BottomTabInset } from '@/constants/theme';
import {
  fetchBackendStatus,
  BackendStatusResponse,
  getBackendBaseUrl,
} from '@/services/api';
import { HIGCard } from '@/components/hig/HIGCard';
import { HIGStatusBadge, StatusLevel } from '@/components/hig/HIGStatusBadge';
import { HIGButton } from '@/components/hig/HIGButton';
import { HIGMetricTile } from '@/components/hig/HIGMetricTile';

export default function HomeScreen() {
  const scheme = useColorScheme();
  const theme = AppleHIGColors[scheme === 'dark' ? 'dark' : 'light'];

  const [statusData, setStatusData] = useState<BackendStatusResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadStatus = useCallback(async () => {
    setErrorMessage(null);
    const result = await fetchBackendStatus();
    if (result.error) {
      setErrorMessage(result.error);
      setStatusData(null);
    } else {
      setStatusData(result.data);
      setErrorMessage(null);
    }
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadStatus();
  }, [loadStatus]);

  const resolvedStatus: StatusLevel = isLoading
    ? 'loading'
    : statusData?.status === 'healthy'
    ? 'online'
    : statusData?.status === 'degraded'
    ? 'degraded'
    : 'offline';

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.systemGroupedBackground }]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: BottomTabInset + Spacing.four },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.systemBlue}
          />
        }
      >
        {/* iOS HIG Large Header */}
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: theme.systemBlue }]}>
            LOCAL DEVELOPMENT ENVIRONMENT
          </Text>
          <Text style={[styles.title, { color: theme.label }]}>Apex iOS</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryLabel }]}>
            React Native & Expo connected to containerized Fastify & PostgreSQL
          </Text>
        </View>

        {/* Backend Connectivity Status Card */}
        <HIGCard>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons
                name="server-outline"
                size={22}
                color={theme.systemBlue}
                style={styles.cardIcon}
              />
              <Text style={[styles.cardTitle, { color: theme.label }]}>
                Backend Service
              </Text>
            </View>
            <HIGStatusBadge status={resolvedStatus} />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.separator }]} />

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.secondaryLabel }]}>
              Host Endpoint
            </Text>
            <Text style={[styles.infoValue, { color: theme.label }]}>
              {getBackendBaseUrl()}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.secondaryLabel }]}>
              Database Engine
            </Text>
            <Text style={[styles.infoValue, { color: theme.label }]}>
              {statusData?.database.status === 'healthy'
                ? 'PostgreSQL 16 (Connected)'
                : 'PostgreSQL 16 (Unreachable)'}
            </Text>
          </View>

          {errorMessage && (
            <View style={[styles.errorBox, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}>
              <Ionicons name="alert-circle-outline" size={18} color={theme.systemRed} />
              <Text style={[styles.errorText, { color: theme.systemRed }]}>
                {errorMessage}
              </Text>
            </View>
          )}

          <HIGButton
            title="Refresh Connection"
            variant="tinted"
            onPress={loadStatus}
            isLoading={isLoading && !isRefreshing}
            style={styles.actionButton}
          />
        </HIGCard>

        {/* Live Metrics Grid */}
        <Text style={[styles.sectionTitle, { color: theme.secondaryLabel }]}>
          SYSTEM TELEMETRY
        </Text>

        <View style={styles.metricsGrid}>
          <HIGMetricTile
            label="DB Latency"
            value={statusData ? `${statusData.database.latencyMs} ms` : '--'}
            subtitle="SELECT 1 probe"
            accentColor={theme.systemGreen}
          />
          <HIGMetricTile
            label="API Uptime"
            value={statusData ? formatUptime(statusData.uptimeSeconds) : '--'}
            subtitle="Container lifespan"
            accentColor={theme.systemBlue}
          />
          <HIGMetricTile
            label="Memory (RSS)"
            value={statusData ? `${statusData.memory.rssMb} MB` : '--'}
            subtitle="Node.js process"
            accentColor={theme.systemIndigo}
          />
          <HIGMetricTile
            label="Environment"
            value={statusData ? statusData.environment.toUpperCase() : 'DEV'}
            subtitle="Docker Compose"
            accentColor={theme.systemOrange}
          />
        </View>

        {/* Architecture Spec Card */}
        <HIGCard>
          <View style={styles.cardHeaderLeft}>
            <Ionicons
              name="layers-outline"
              size={22}
              color={theme.systemPurple}
              style={styles.cardIcon}
            />
            <Text style={[styles.cardTitle, { color: theme.label }]}>
              Stack Architecture
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.separator }]} />

          <View style={styles.specList}>
            <Text style={[styles.specItem, { color: theme.label }]}>
              • <Text style={{ fontWeight: '600' }}>Client:</Text> React Native + Expo (Apple HIG design)
            </Text>
            <Text style={[styles.specItem, { color: theme.label }]}>
              • <Text style={{ fontWeight: '600' }}>API:</Text> Fastify (Node.js/TypeScript) on port 8003
            </Text>
            <Text style={[styles.specItem, { color: theme.label }]}>
              • <Text style={{ fontWeight: '600' }}>Database:</Text> PostgreSQL 16 on port 5433
            </Text>
            <Text style={[styles.specItem, { color: theme.label }]}>
              • <Text style={{ fontWeight: '600' }}>Orchestration:</Text> Docker Compose v2
            </Text>
          </View>
        </HIGCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  header: {
    marginBottom: Spacing.three,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.half,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: Spacing.half,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    marginRight: Spacing.two,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.two,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.one,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.two,
    borderRadius: 8,
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  actionButton: {
    marginTop: Spacing.three,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: Spacing.four,
    marginBottom: Spacing.one,
    paddingHorizontal: Spacing.one,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.one,
  },
  specList: {
    gap: Spacing.one + Spacing.half,
    marginTop: Spacing.one,
  },
  specItem: {
    fontSize: 14,
    lineHeight: 20,
  },
});
