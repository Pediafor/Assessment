// Certificate generation utility for WebTransport
import * as selfsigned from 'selfsigned';
import { createHash } from 'crypto';
import { WebTransportCertificate } from '../types/webtransport';

export interface CertificateOptions {
  days?: number;
  algorithm?: string;
  keySize?: number;
  hostname?: string;
}

export async function generateWebTransportCertificate(
  options: CertificateOptions = {}
): Promise<WebTransportCertificate> {
  const {
    days = 14, // WebTransport certificates should be short-lived
    algorithm = 'rs256',
    keySize = 2048,
    hostname = 'localhost'
  } = options;

  // Certificate attributes
  const attrs = [
    { name: 'commonName', value: hostname },
    { name: 'countryName', value: 'US' },
    { name: 'stateOrProvinceName', value: 'State' },
    { name: 'localityName', value: 'City' },
    { name: 'organizationName', value: 'Assessment Platform' },
    { name: 'organizationalUnitName', value: 'Development' }
  ];

  // Generate the certificate
  const pems = selfsigned.generate(attrs, {
    days,
    algorithm,
    keySize,
    extensions: [
      {
        name: 'subjectAltName',
        altNames: [
          { type: 2, value: hostname }, // DNS
          { type: 7, ip: '127.0.0.1' },  // IP
          { type: 7, ip: '::1' }         // IPv6
        ]
      },
      {
        name: 'keyUsage',
        digitalSignature: true,
        keyEncipherment: true
      },
      {
        name: 'extKeyUsage',
        serverAuth: true
      }
    ]
  });

  // Calculate fingerprint (SHA-256 hash of the certificate)
  const certBuffer = Buffer.from(pems.cert.replace(/-----BEGIN CERTIFICATE-----|\n|-----END CERTIFICATE-----/g, ''), 'base64');
  const fingerprint = createHash('sha256').update(certBuffer).digest('hex').toUpperCase().match(/.{2}/g)?.join(':') || '';

  return {
    cert: pems.cert,
    private: pems.private,
    fingerprint
  };
}

export function getCertificateFingerprint(cert: string): string {
  const certBuffer = Buffer.from(cert.replace(/-----BEGIN CERTIFICATE-----|\n|-----END CERTIFICATE-----/g, ''), 'base64');
  return createHash('sha256').update(certBuffer).digest('hex').toUpperCase().match(/.{2}/g)?.join(':') || '';
}