import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, ImageBackground, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../shared/navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';

type LandingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Landing'>;

const { width } = Dimensions.get('window');

const LandingScreen: React.FC = () => {
  const navigation = useNavigation<LandingScreenNavigationProp>();

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require('../../../assets/images/LogoTic.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.logoText}>AgroTech</Text>
          </View>
          <TouchableOpacity onPress={handleLogin} style={styles.loginButtonHeader}>
            <Text style={styles.loginButtonHeaderText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>

        {/* HERO SECTION */}
        <ImageBackground source={require('../../../assets/images/FondoLogin.jpeg')} style={styles.heroSection}>
          <View style={styles.overlay} />
          <View style={styles.heroContent}>
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>Plataforma para productores y empresas</Text>
            </View>
            <Text style={styles.heroTitle}>Gestiona tus Cultivos con Inteligencia</Text>
            <Text style={styles.heroSubtitle}>
              Optimiza, planifica y analiza cada etapa de tu producción. Todo en un solo lugar.
            </Text>
            <View style={styles.heroButtons}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
                <Text style={styles.primaryButtonText}>Comenzar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Más información</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>

        {/* FEATURES SECTION */}
        <View style={styles.featuresSection}>
          <FeatureCard 
            title="Monitoreo inteligente" 
            text="Métricas y alertas en tiempo real para la salud de tus cultivos y el estado de los lotes." 
          />
          <FeatureCard 
            title="Gestión de recursos" 
            text="Planifica y controla insumos, mano de obra y costos con flujos simples y efectivos." 
          />
          <FeatureCard 
            title="Análisis de datos" 
            text="Paneles de rendimiento e históricos para decisiones más rápidas y precisas." 
          />
        </View>

        {/* ABOUT SECTION */}
        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>Acerca de AgroTech</Text>
          <Text style={styles.aboutText}>
            Conectamos innovación y sostenibilidad para ayudarte a gestionar tus cultivos con herramientas modernas.
          </Text>
          <View style={styles.statsContainer}>
            <StatCard label="Ahorro en costos" value="hasta 25%" />
            <StatCard label="Procesos digitalizados" value="+40" />
            <StatCard label="Alertas y métricas" value="en tiempo real" />
          </View>
        </View>

        {/* CTA SECTION */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>¿Listo para transformar tu cultivo?</Text>
          <Text style={styles.ctaText}>Empieza hoy a digitalizar tu producción agrícola con AgroTech.</Text>
          <TouchableOpacity style={styles.ctaButton} onPress={handleRegister}>
            <Text style={styles.ctaButtonText}>Crear cuenta gratis</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© {new Date().getFullYear()} AgroTech</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const FeatureCard = ({ title, text }: { title: string, text: string }) => (
  <View style={styles.featureCard}>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const StatCard = ({ label, value }: { label: string, value: string }) => (
  <View style={styles.statCard}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loginButtonHeader: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  loginButtonHeaderText: {
    color: '#166534',
    fontWeight: '600',
    fontSize: 12,
  },
  heroSection: {
    height: 500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  heroContent: {
    padding: 20,
    alignItems: 'center',
    zIndex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 20,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
    marginRight: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: 300,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  primaryButtonText: {
    color: '#047857',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  featuresSection: {
    padding: 20,
    backgroundColor: '#fff',
  },
  featureCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.05)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
      },
    }),
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  aboutSection: {
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 24,
    lineHeight: 24,
  },
  statsContainer: {
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
    marginTop: 4,
  },
  ctaSection: {
    padding: 40,
    backgroundColor: '#059669',
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
  },
  ctaButtonText: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    color: '#9ca3af',
    fontSize: 12,
  },
});

export default LandingScreen;
