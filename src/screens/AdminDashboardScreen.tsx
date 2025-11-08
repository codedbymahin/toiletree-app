import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Nunito_400Regular, Nunito_500Medium } from '@expo-google-fonts/nunito';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ToiletSubmission, Report, Toilet } from '../types';
import { adminService } from '../services/admin';
import { LoadingSpinner, ConfirmationModal, SegmentedControl, ToiletCard } from '../components';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import { useNavigation } from '@react-navigation/native';

export const AdminDashboardScreen = () => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'reports' | 'deletions'>('submissions');
  const [submissions, setSubmissions] = useState<ToiletSubmission[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<Array<{
    id: string;
    username: string;
    email?: string;
    deletion_requested_at: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Nunito_400Regular,
    Nunito_500Medium,
  });
  const navigation = useNavigation();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    if (activeTab === 'submissions') {
      await loadSubmissions();
    } else if (activeTab === 'reports') {
      await loadReports();
    } else if (activeTab === 'deletions') {
      await loadDeletionRequests();
    }
    setLoading(false);
  };

  const loadSubmissions = async () => {
    const { submissions: data, error } = await adminService.getPendingSubmissions();
    
    if (error) {
      showErrorToast('Error', 'Failed to load submissions');
    } else {
      setSubmissions(data);
    }
  };

  const loadReports = async () => {
    const { reports: data, error } = await adminService.getReports();
    
    if (error) {
      showErrorToast('Error', 'Failed to load reports');
    } else {
      setReports(data);
    }
  };

  const loadDeletionRequests = async () => {
    const { requests, error } = await adminService.getDeletionRequests();
    
    if (error) {
      showErrorToast('Error', 'Failed to load deletion requests');
    } else {
      setDeletionRequests(requests);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleApproveSubmissionClick = (submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    setApproveModalVisible(true);
  };

  const handleApproveSubmission = async () => {
    if (!selectedSubmissionId) return;
    
    setApproveModalVisible(false);
    const { success, error } = await adminService.approveSubmission(selectedSubmissionId);
    
    if (error) {
      showErrorToast('Error', error);
    } else {
      showSuccessToast('Success', 'Submission approved!');
      loadSubmissions();
    }
    
    setSelectedSubmissionId(null);
  };

  const handleRejectSubmissionClick = (submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    setRejectModalVisible(true);
  };

  const handleRejectSubmission = async () => {
    if (!selectedSubmissionId) return;
    
    setRejectModalVisible(false);
    const { success, error } = await adminService.rejectSubmission(
      selectedSubmissionId,
      'Rejected by admin'
    );
    
    if (error) {
      showErrorToast('Error', error);
    } else {
      showSuccessToast('Success', 'Submission rejected');
      loadSubmissions();
    }
    
    setSelectedSubmissionId(null);
  };

  const handleResolveReport = async (reportId: string) => {
    const { success, error } = await adminService.updateReportStatus(reportId, 'resolved');
    
    if (error) {
      showErrorToast('Error', error);
    } else {
      showSuccessToast('Success', 'Report marked as resolved');
      loadReports();
    }
  };

  const handleDismissReport = async (reportId: string) => {
    const { success, error } = await adminService.updateReportStatus(reportId, 'dismissed');
    
    if (error) {
      showErrorToast('Error', error);
    } else {
      showSuccessToast('Success', 'Report dismissed');
      loadReports();
    }
  };

  // Convert submission to Toilet format for ToiletCard
  const submissionToToilet = (submission: ToiletSubmission): Toilet => {
    return {
      id: submission.id,
      name: submission.name,
      address: submission.address,
      latitude: submission.latitude,
      longitude: submission.longitude,
      photo_url: submission.photo_url,
      status: 'active',
      created_by: submission.submitted_by,
      created_at: submission.submitted_at,
      is_female_friendly: submission.is_female_friendly,
      has_water_access: submission.has_water_access,
      is_paid: submission.is_paid,
    };
  };

  if (loading || !fontsLoaded) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#EAF4F4', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Segmented Control */}
      <SegmentedControl
        options={[
          { label: 'Submissions', value: 'submissions', count: submissions.length },
          { label: 'Reports', value: 'reports', count: reports.length },
          { label: 'Deletions', value: 'deletions', count: deletionRequests.length },
        ]}
        selectedValue={activeTab}
        onValueChange={(value) => setActiveTab(value as any)}
      />

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {activeTab === 'submissions' ? (
          // Submissions List
          <View style={styles.contentContainer}>
            {submissions.length > 0 ? (
              submissions.map((submission) => {
                const toilet = submissionToToilet(submission);
                return (
                  <View key={submission.id} style={styles.submissionCardWrapper}>
                    <ToiletCard
                      toilet={toilet}
                      onPress={() => {
                        // Could navigate to submission details if needed
                      }}
                    />
                    <View style={styles.submissionMeta}>
                      <Text style={styles.submissionMetaText}>
                        Submitted by: {(submission as any).profiles?.username || 'Unknown'}
                      </Text>
                    </View>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.approveButton}
                        onPress={() => handleApproveSubmissionClick(submission.id)}
                        activeOpacity={0.8}
                      >
                        <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
                        <Text style={styles.approveButtonText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => handleRejectSubmissionClick(submission.id)}
                        activeOpacity={0.8}
                      >
                        <MaterialCommunityIcons name="close" size={20} color="#D62828" />
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No pending submissions</Text>
              </View>
            )}
          </View>
        ) : activeTab === 'reports' ? (
          // Reports List
          <View style={styles.contentContainer}>
            {reports.length > 0 ? (
              reports.map((report) => (
                <View key={report.id} style={styles.reportCard}>
                  <View style={styles.reportHeader}>
                    <Text style={styles.reportTitle}>
                      {report.toilets?.name || 'Unknown Toilet'}
                    </Text>
                    <View style={styles.issueTypeBadge}>
                      <Text style={styles.issueTypeText}>
                        {report.issue_type.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.reportDescription}>
                    {report.description}
                  </Text>
                  <Text style={styles.reportMeta}>
                    Reported by: {report.profiles?.username || 'Unknown'}
                  </Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.approveButton}
                      onPress={() => handleResolveReport(report.id)}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
                      <Text style={styles.approveButtonText}>Resolve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={() => handleDismissReport(report.id)}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="close" size={20} color="#D62828" />
                      <Text style={styles.rejectButtonText}>Dismiss</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No open reports</Text>
              </View>
            )}
          </View>
        ) : (
          // Deletion Requests List
          <View style={styles.contentContainer}>
            {deletionRequests.length > 0 ? (
              deletionRequests.map((request) => {
                const requestDate = new Date(request.deletion_requested_at);
                const timeAgo = getTimeAgo(requestDate);
                
                return (
                  <View key={request.id} style={styles.deletionCard}>
                    <View style={styles.deletionHeader}>
                      <View style={styles.deletionInfo}>
                        <Text style={styles.deletionTitle}>{request.username}</Text>
                        {request.email && (
                          <Text style={styles.deletionEmail}>{request.email}</Text>
                        )}
                        <Text style={styles.deletionId}>
                          User ID: {request.id.substring(0, 8)}...
                        </Text>
                      </View>
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingBadgeText}>PENDING</Text>
                      </View>
                    </View>
                    <View style={styles.deletionMeta}>
                      <Text style={styles.deletionMetaText}>
                        <Text style={styles.deletionMetaLabel}>Requested:</Text>{' '}
                        {requestDate.toLocaleString()}
                      </Text>
                      <Text style={styles.deletionTimeAgo}>{timeAgo}</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No deletion requests</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Approve Submission Confirmation Modal */}
      <ConfirmationModal
        isVisible={approveModalVisible}
        title="Approve Submission"
        description="Are you sure you want to approve this toilet submission?"
        confirmText="Approve"
        cancelText="Cancel"
        onConfirm={handleApproveSubmission}
        onCancel={() => {
          setApproveModalVisible(false);
          setSelectedSubmissionId(null);
        }}
        confirmButtonColor="#2ECC71"
      />

      {/* Reject Submission Confirmation Modal */}
      <ConfirmationModal
        isVisible={rejectModalVisible}
        title="Reject Submission"
        description="Are you sure you want to reject this submission?"
        confirmText="Reject"
        cancelText="Cancel"
        onConfirm={handleRejectSubmission}
        onCancel={() => {
          setRejectModalVisible(false);
          setSelectedSubmissionId(null);
        }}
      />
    </View>
  );
};

const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return diffMins <= 0 ? 'Just now' : `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  gradientHeader: {
    paddingBottom: 16,
  },
  safeArea: {
    paddingTop: 8,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Poppins_700Bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  contentContainer: {
    padding: 16,
  },
  submissionCardWrapper: {
    marginBottom: 20,
  },
  submissionMeta: {
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  submissionMetaText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Nunito_400Regular',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2ECC71',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Nunito_500Medium',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#D62828',
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D62828',
    fontFamily: 'Nunito_500Medium',
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Poppins_700Bold',
    marginRight: 12,
  },
  issueTypeBadge: {
    backgroundColor: '#FDE8E8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D62828',
  },
  issueTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D62828',
    fontFamily: 'Nunito_500Medium',
  },
  reportDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: 'Nunito_400Regular',
  },
  reportMeta: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 16,
    fontFamily: 'Nunito_400Regular',
  },
  deletionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  deletionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deletionInfo: {
    flex: 1,
  },
  deletionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Poppins_700Bold',
  },
  deletionEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'Nunito_400Regular',
  },
  deletionId: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Nunito_400Regular',
  },
  pendingBadge: {
    backgroundColor: '#FDE8E8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D62828',
  },
  pendingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D62828',
    fontFamily: 'Nunito_500Medium',
  },
  deletionMeta: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  deletionMetaText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'Nunito_400Regular',
  },
  deletionMetaLabel: {
    fontWeight: '600',
    fontFamily: 'Nunito_500Medium',
  },
  deletionTimeAgo: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Nunito_400Regular',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontFamily: 'Nunito_400Regular',
  },
});
